import { ethers } from "ethers";
import { config } from "../configs/config";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { prisma } from ".";
import {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionPayment,
} from "@prisma/client";
import { voucherLogger } from '../configs/voucherLogger';

// Interface for subscription payment data
export interface ISubscriptionPaymentData {
  listenerId: number;
  planId: number;
  amount: number;
  currency?: string;
  transactionHash?: string;
  vaultDepositId?: string;
}

// Interface for payment verification
export interface IPaymentVerification {
  isValid: boolean;
  amount: number;
  transactionHash: string;
  blockNumber?: number;
}

/**
 * Create a new subscription payment record
 * @param paymentData - Payment data for the subscription
 * @returns Created subscription payment
 */
const createSubscriptionPayment = async (
  paymentData: ISubscriptionPaymentData
): Promise<SubscriptionPayment> => {
  try {
    // Verify the subscription plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: paymentData.planId },
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription plan not found");
    }

    // Verify the listener exists
    const listener = await prisma.listener.findUnique({
      where: { id: paymentData.listenerId },
    });

    if (!listener) {
      throw new ApiError(httpStatus.NOT_FOUND, "Listener not found");
    }

    // Create or get existing active subscription
    let subscription = await prisma.userSubscription.findFirst({
      where: {
        listenerId: paymentData.listenerId,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      // Create new subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.duration);

      subscription = await prisma.userSubscription.create({
        data: {
          listenerId: paymentData.listenerId,
          planId: paymentData.planId,
          status: "PENDING",
          startDate,
          endDate,
          autoRenew: false,
        },
      });
    }

    // Create payment record
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: paymentData.amount,
        currency: paymentData.currency || "ETH",
        status: "PENDING",
        transactionHash: paymentData.transactionHash,
        vaultDepositId: paymentData.vaultDepositId,
      },
    });

    return payment;
  } catch (error) {
    console.error("Error creating subscription payment:", error);
    throw error;
  }
};

/**
 * Verify payment on blockchain
 * @param transactionHash - Transaction hash to verify
 * @param expectedAmount - Expected payment amount
 * @returns Payment verification result
 */
const verifyPaymentOnChain = async (
  transactionHash: string,
  expectedAmount: number
): Promise<IPaymentVerification> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(transactionHash);

    if (!receipt) {
      return {
        isValid: false,
        amount: 0,
        transactionHash,
      };
    }

    // Get transaction details
    const transaction = await provider.getTransaction(transactionHash);

    if (!transaction) {
      return {
        isValid: false,
        amount: 0,
        transactionHash,
      };
    }

    // Convert wei to ether for comparison
    const actualAmount = parseFloat(
      ethers.utils.formatEther(transaction.value)
    );

    // Verify amount matches (with small tolerance for gas fees)
    const isAmountValid = Math.abs(actualAmount - expectedAmount) < 0.001;

    return {
      isValid: receipt.status === 1 && isAmountValid,
      amount: actualAmount,
      transactionHash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("Error verifying payment on chain:", error);
    return {
      isValid: false,
      amount: 0,
      transactionHash,
    };
  }
};

/**
 * Process payment confirmation
 * @param paymentId - Payment ID to confirm
 * @param transactionHash - Confirmed transaction hash
 * @returns Updated payment and subscription
 */
const confirmPayment = async (
  paymentId: string,
  transactionHash: string
): Promise<{
  payment: SubscriptionPayment;
  subscription: UserSubscription;
}> => {
  try {
    // Get payment record
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
    }

    // Verify payment on blockchain
    const verification = await verifyPaymentOnChain(
      transactionHash,
      payment.amount
    );

    if (!verification.isValid) {
      // Update payment status to failed
      const updatedPayment = await prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
          transactionHash,
        },
      });

      throw new ApiError(httpStatus.BAD_REQUEST, "Payment verification failed");
    }

    // Update payment status to completed
    const updatedPayment = await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        transactionHash,
      },
    });

    // Log voucher execution
    if (payment.vaultDepositId) {
      voucherLogger.logVoucherExecuted({
        voucherId: payment.vaultDepositId,
        walletAddress: payment.subscription?.listenerId?.toString() || '',
        amount: payment.amount?.toString(),
        transactionHash,
        executionTime: Date.now() - payment.createdAt.getTime(),
        metadata: { subscriptionId: payment.subscriptionId }
      });
    }

    // Update subscription status to active
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: payment.subscriptionId! },
      data: {
        status: "ACTIVE",
        paymentReference: transactionHash,
      },
    });

    // Update listener subscription level
    if (payment.subscription) {
      await prisma.listener.update({
        where: { id: payment.subscription.listenerId },
        data: {
          subscriptionLevel: payment.subscription.plan.level,
        },
      });
    }

    return {
      payment: updatedPayment,
      subscription: updatedSubscription,
    };
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
};

/**
 * Get payment by ID
 * @param paymentId - Payment ID
 * @returns Payment record with subscription details
 */
const getPaymentById = async (paymentId: string) => {
  try {
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            plan: true,
            listener: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
    }

    return payment;
  } catch (error) {
    console.error("Error getting payment:", error);
    throw error;
  }
};

/**
 * Get payments by listener ID
 * @param listenerId - Listener ID
 * @returns Array of payments for the listener
 */
const getPaymentsByListener = async (listenerId: number) => {
  try {
    const payments = await prisma.subscriptionPayment.findMany({
      where: {
        subscription: {
          listenerId,
        },
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return payments;
  } catch (error) {
    console.error("Error getting payments by listener:", error);
    throw error;
  }
};

/**
 * Monitor vault deposits for subscription payments
 * @param vaultDepositId - Vault deposit ID to monitor
 * @returns Monitoring result
 */
const monitorVaultDeposit = async (vaultDepositId: string) => {
  try {
    // Find payment by vault deposit ID
    const payment = await prisma.subscriptionPayment.findFirst({
      where: { vaultDepositId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Payment not found for vault deposit"
      );
    }

    // Here you would implement vault deposit monitoring logic
    // This could involve checking the vault contract for deposit confirmation
    // For now, we'll return the payment status

    return {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      vaultDepositId,
    };
  } catch (error) {
    console.error("Error monitoring vault deposit:", error);
    throw error;
  }
};

/**
 * Process failed payments
 * @param paymentId - Payment ID to mark as failed
 * @param reason - Failure reason
 * @returns Updated payment
 */
const processFailedPayment = async (
  paymentId: string,
  reason: string
): Promise<SubscriptionPayment> => {
  try {
    const updatedPayment = await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
      },
    });

    // Log voucher failure
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: { subscription: true }
    });
    
    if (payment?.vaultDepositId) {
      voucherLogger.logVoucherFailed({
        voucherId: payment.vaultDepositId,
        walletAddress: payment.subscription?.listenerId?.toString() || '',
        amount: payment.amount?.toString(),
        errorMessage: reason || 'Payment processing failed',
        metadata: { subscriptionId: payment.subscriptionId }
      });
    }

    // Also update the subscription status if needed
    if (updatedPayment.subscriptionId) {
      await prisma.userSubscription.update({
        where: { id: updatedPayment.subscriptionId },
        data: {
          status: "CANCELLED",
        },
      });
    }

    return updatedPayment;
  } catch (error) {
    console.error("Error processing failed payment:", error);
    throw error;
  }
};

export {
  createSubscriptionPayment,
  verifyPaymentOnChain,
  confirmPayment,
  getPaymentById,
  getPaymentsByListener,
  monitorVaultDeposit,
  processFailedPayment,
};
