import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { prisma } from '.';
import { UserSubscription, SubscriptionPlan } from '@prisma/client';
import { voucherLogger } from '../configs/voucherLogger';
import PaymentTrackingService from './paymentTracking.service';

// Interface for voucher-based subscription creation
export interface ICreateVoucherSubscription {
  listenerId: number;
  planId: number;
  walletAddress: string;
  amount: number;
  voucherId?: string;
  autoRenew?: boolean;
}

// Interface for subscription activation via voucher
export interface IActivateVoucherSubscription {
  voucherId: string;
  transactionHash: string;
}

/**
 * Create a subscription through voucher payment system
 * @param subscriptionData - Voucher subscription data
 * @returns Created subscription and payment voucher
 */
const createVoucherSubscription = async (
  subscriptionData: ICreateVoucherSubscription
): Promise<{
  subscription: UserSubscription;
  voucherId: string;
  paymentId: string;
}> => {
  try {
    // Verify listener exists
    const listener = await prisma.listener.findUnique({
      where: { id: subscriptionData.listenerId },
    });

    if (!listener) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Listener not found');
    }

    // Verify plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionData.planId },
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Subscription plan not found');
    }

    // Check for existing active subscription
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        listenerId: subscriptionData.listenerId,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'User already has an active subscription'
      );
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    // Create subscription in PENDING status
    const subscription = await prisma.userSubscription.create({
      data: {
        listenerId: subscriptionData.listenerId,
        planId: subscriptionData.planId,
        status: 'PENDING',
        startDate,
        endDate,
        autoRenew: subscriptionData.autoRenew || false,
      },
      include: {
        plan: true,
        listener: {
          include: {
            user: true,
          },
        },
      },
    });

    // Generate voucher ID if not provided
    const voucherId = subscriptionData.voucherId || `voucher_${Date.now()}_${subscription.id}`;

    // Create payment record with voucher
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        walletAddress: subscriptionData.walletAddress.toLowerCase(),
        amount: subscriptionData.amount,
        currency: 'CTSI',
        status: 'pending',
        voucherId,
        subscriptionPlanId: subscriptionData.planId,
      },
    });

    // Log voucher creation
    voucherLogger.logVoucherCreated({
      voucherId,
      walletAddress: subscriptionData.walletAddress.toLowerCase(),
      amount: subscriptionData.amount.toString(),
      metadata: {
        subscriptionId: subscription.id,
        planId: subscriptionData.planId,
        listenerId: subscriptionData.listenerId,
        method: 'create_subscription'
      }
    });

    return {
      subscription,
      voucherId,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error('Error creating voucher subscription:', error);
    throw error;
  }
};

/**
 * Activate subscription when voucher payment is confirmed
 * @param activationData - Voucher activation data
 * @returns Activated subscription
 */
const activateVoucherSubscription = async (
  activationData: IActivateVoucherSubscription
): Promise<UserSubscription> => {
  try {
    // Find payment by voucher ID
    const payment = await prisma.subscriptionPayment.findFirst({
      where: { voucherId: activationData.voucherId },
      include: {
        subscription: {
          include: {
            plan: true,
            listener: true,
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Voucher payment not found');
    }

    if (!payment.subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Associated subscription not found');
    }

    if (payment.status === 'executed') {
      throw new ApiError(httpStatus.CONFLICT, 'Voucher already executed');
    }

    // Update payment status
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'executed',
        transactionHash: activationData.transactionHash,
        executedAt: new Date(),
      },
    });

    // Activate subscription
    const activatedSubscription = await prisma.userSubscription.update({
      where: { id: payment.subscription.id },
      data: {
        status: 'ACTIVE',
      },
      include: {
        plan: true,
        listener: {
          include: {
            user: true,
          },
        },
      },
    });

    // Update listener's subscription level
    if (payment.subscription.listener) {
      await prisma.listener.update({
        where: { id: payment.subscription.listener.id },
        data: {
          subscriptionLevel: payment.subscription.plan?.level || 'FREE',
        },
      });
    }

    // Log voucher execution
    voucherLogger.logVoucherExecuted({
      voucherId: activationData.voucherId,
      walletAddress: payment.walletAddress!,
      amount: payment.amount?.toString(),
      transactionHash: activationData.transactionHash,
      executionTime: Date.now() - payment.createdAt.getTime(),
      metadata: {
        subscriptionId: payment.subscription.id,
        planId: payment.subscription.planId,
        listenerId: payment.subscription.listenerId,
      }
    });

    return activatedSubscription;
  } catch (error) {
    console.error('Error activating voucher subscription:', error);
    throw error;
  }
};

/**
 * Cancel voucher-based subscription
 * @param voucherId - Voucher ID to cancel
 * @param reason - Cancellation reason
 * @returns Cancelled subscription
 */
const cancelVoucherSubscription = async (
  voucherId: string,
  reason: string = 'User requested cancellation'
): Promise<UserSubscription> => {
  try {
    // Find payment by voucher ID
    const payment = await prisma.subscriptionPayment.findFirst({
      where: { voucherId },
      include: {
        subscription: {
          include: {
            plan: true,
            listener: true,
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Voucher payment not found');
    }

    if (!payment.subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Associated subscription not found');
    }

    // Update payment status to failed
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
      },
    });

    // Cancel subscription
    const cancelledSubscription = await prisma.userSubscription.update({
      where: { id: payment.subscription.id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        plan: true,
        listener: {
          include: {
            user: true,
          },
        },
      },
    });

    // Reset listener's subscription level to FREE
    if (payment.subscription.listener) {
      await prisma.listener.update({
        where: { id: payment.subscription.listener.id },
        data: {
          subscriptionLevel: 'FREE',
        },
      });
    }

    // Log voucher failure
    voucherLogger.logVoucherFailed({
      voucherId,
      walletAddress: payment.walletAddress!,
      amount: payment.amount?.toString(),
      errorMessage: reason,
      metadata: {
        subscriptionId: payment.subscription.id,
        planId: payment.subscription.planId,
        listenerId: payment.subscription.listenerId,
      }
    });

    return cancelledSubscription;
  } catch (error) {
    console.error('Error cancelling voucher subscription:', error);
    throw error;
  }
};

/**
 * Get subscription by voucher ID
 * @param voucherId - Voucher ID
 * @returns Subscription with payment details
 */
const getSubscriptionByVoucher = async (voucherId: string) => {
  try {
    const payment = await prisma.subscriptionPayment.findFirst({
      where: { voucherId },
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
      throw new ApiError(httpStatus.NOT_FOUND, 'Voucher payment not found');
    }

    return {
      payment,
      subscription: payment.subscription,
      voucherStatus: payment.status,
      executedAt: payment.executedAt,
      transactionHash: payment.transactionHash,
    };
  } catch (error) {
    console.error('Error getting subscription by voucher:', error);
    throw error;
  }
};

/**
 * Process voucher payment request through Cartesi
 * @param paymentRequest - Payment request data
 * @returns Payment processing result
 */
const processVoucherPaymentRequest = async (paymentRequest: {
  message: string;
  signer: string;
  signature: string;
}) => {
  try {
    // Use payment tracking service to process the request
    const paymentTrackingService = new PaymentTrackingService();
    const result = await paymentTrackingService.processPaymentRequest(paymentRequest);
    
    if (result.success && result.voucherId) {
      // Check if this voucher is associated with a subscription
      const subscriptionData = await getSubscriptionByVoucher(result.voucherId);
      
      return {
        ...result,
        subscriptionId: subscriptionData.subscription?.id,
        planId: subscriptionData.subscription?.planId,
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error processing voucher payment request:', error);
    throw error;
  }
};

export {
  createVoucherSubscription,
  activateVoucherSubscription,
  cancelVoucherSubscription,
  getSubscriptionByVoucher,
  processVoucherPaymentRequest,
};