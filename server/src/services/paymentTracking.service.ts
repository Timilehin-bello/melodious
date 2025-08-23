import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { config } from '../configs/config';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { IPayload } from '../interfaces';
import { voucherLogger } from '../configs/voucherLogger';

const prisma = new PrismaClient();

// Interfaces
interface IVoucherPayload {
  method: 'authorize_payment' | 'process_subscription' | 'cancel_subscription';
  args: {
    walletAddress: string;
    amount: string;
    subscriptionPlanId?: string;
    voucherId?: string;
    signer?: string;
  };
}

interface IPaymentAuthResult {
  success: boolean;
  voucherId?: string;
  message: string;
  transactionHash?: string;
}

interface IVoucherMonitoringResult {
  voucherId: string;
  status: 'pending' | 'executed' | 'failed';
  transactionHash?: string;
  executedAt?: Date;
}

class PaymentTrackingService {
  constructor() {}

  // Verify transaction signature (similar to transaction service)
  private async verifyTransaction(payload: IPayload): Promise<string> {
    try {
      const realSigner = await ethers.utils.verifyMessage(
        payload.message,
        payload.signature
      );
      return realSigner;
    } catch (err) {
      console.log(err);
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid signature');
    }
  }

  // Generate transaction (similar to transaction service)
  private async generateTransaction(payload: IPayload) {
    try {
      const newTx = {
        data: JSON.stringify(JSON.parse(payload.message).data),
        signer: payload.signer,
      };
      return newTx;
    } catch (error) {
      // Log error
      voucherLogger.logCartesiInteraction({
        voucherId: 'unknown',
        action: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(error);
      throw error;
    }
  }

  // Convert object to hex (similar to transaction service)
  private async objectToHex(obj: any): Promise<string> {
    const jsonString = JSON.stringify(obj);
    return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(jsonString));
  }

  // Submit transaction to Cartesi (similar to transaction service)
  private async submitTransaction(tx: { data: string; signer: string }) {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

    try {
      const signer = new ethers.Wallet(config.privateKey, provider);

      const abi = [
        "function addInput(address appContract, bytes calldata payload) external returns (bytes32)",
      ];

      const cleanedPayload = JSON.parse(tx.data);
      console.log(`Payment method is: ${cleanedPayload.method}`);
      console.log(`Payment Tx is cleaned: ${JSON.stringify(cleanedPayload)}`);

      const parsedObject = JSON.parse(JSON.stringify(tx));
      cleanedPayload.args.signer = parsedObject.signer;

      const txHex = await this.objectToHex(cleanedPayload);
      console.log(`Payment Hex representation is: ${txHex}`);

      const contract = new ethers.Contract(config.inputboxAddress, abi, signer);
      console.log(`Payment contract is: ${contract.address}`);

      const finalTx = await contract.addInput(config.dappAddress, txHex);
      const isTxComplete = await finalTx.wait();
      console.log(`Payment Transaction hash is: ${isTxComplete.transactionHash}`);

      // Process the payload based on its method
      const serverResponse = await this.processPaymentPayload(cleanedPayload, tx);

      return {
        isTxComplete,
        serverResponse,
      };
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // Process payment payload based on method
  private async processPaymentPayload(
    cleanedPayload: IVoucherPayload,
    tx: { data: string; signer: string }
  ): Promise<any> {
    const method = cleanedPayload.method;
    console.log(`Processing payment method: ${method}`);

    switch (method) {
      case 'authorize_payment':
        return await this.handleAuthorizePayment(cleanedPayload, tx);
      case 'process_subscription':
        return await this.handleProcessSubscription(cleanedPayload, tx);
      case 'cancel_subscription':
        return await this.handleCancelSubscription(cleanedPayload, tx);
      default:
        console.log(`No handler found for payment method: ${method}`);
        return null;
    }
  }

  // Handle authorize payment method
  private async handleAuthorizePayment(
    cleanedPayload: IVoucherPayload,
    tx: { data: string; signer: string }
  ) {
    // Create voucher record in database
    const voucherId = cleanedPayload.args.voucherId || `voucher_${Date.now()}`;
    const voucher = await prisma.subscriptionPayment.create({
      data: {
        walletAddress: tx.signer.toLowerCase(),
        amount: parseFloat(cleanedPayload.args.amount),
        status: 'pending',
        subscriptionPlanId: cleanedPayload.args.subscriptionPlanId ? parseInt(cleanedPayload.args.subscriptionPlanId) : null,
        voucherId,
      },
    });

    // Log voucher creation
    voucherLogger.logVoucherCreated({
      voucherId,
      walletAddress: tx.signer.toLowerCase(),
      amount: cleanedPayload.args.amount,
      metadata: { method: 'authorize_payment', subscriptionPlanId: cleanedPayload.args.subscriptionPlanId }
    });

    console.log(`Payment voucher created: ${JSON.stringify(voucher)}`);
    return voucher;
  }

  // Handle process subscription method
  private async handleProcessSubscription(
    cleanedPayload: IVoucherPayload,
    tx: { data: string; signer: string }
  ) {
    // Update voucher status and process subscription
    if (cleanedPayload.args.voucherId) {
      const updatedVoucher = await prisma.subscriptionPayment.update({
        where: { voucherId: cleanedPayload.args.voucherId },
        data: {
          status: 'executed',
          executedAt: new Date(),
        },
      });

      console.log(`Subscription processed: ${JSON.stringify(updatedVoucher)}`);
      return updatedVoucher;
    }
    return null;
  }

  // Handle cancel subscription method
  private async handleCancelSubscription(
    cleanedPayload: IVoucherPayload,
    tx: { data: string; signer: string }
  ) {
    // Update voucher status to failed/cancelled
    if (cleanedPayload.args.voucherId) {
      const cancelledVoucher = await prisma.subscriptionPayment.update({
        where: { voucherId: cleanedPayload.args.voucherId },
        data: {
          status: 'failed',
          updatedAt: new Date(),
        },
      });

      console.log(`Subscription cancelled: ${JSON.stringify(cancelledVoucher)}`);
      return cancelledVoucher;
    }
    return null;
  }

  // Main method to process payment request (similar to addTransactionRequest)
  async processPaymentRequest(payload: IPayload): Promise<IPaymentAuthResult> {
    try {
      const signer = await this.verifyTransaction(payload);

      console.log("Payment verify Transaction", JSON.stringify(signer));

      if (signer !== payload.signer) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid signature");
      }

      const tx = await this.generateTransaction(payload);
      const status = await this.submitTransaction(tx);
      console.log("Payment status", status);

      if (status && status.isTxComplete) {
        // Log successful Cartesi interaction
        voucherLogger.logCartesiInteraction({
          voucherId: status.serverResponse?.voucherId || 'unknown',
          action: 'submit',
          transactionHash: status.isTxComplete.transactionHash,
          blockNumber: status.isTxComplete.blockNumber
        });

        return {
          success: true,
          voucherId: status.serverResponse?.voucherId,
          message: 'Payment request processed successfully',
          transactionHash: status.isTxComplete.transactionHash,
        };
      } else {
        // Log failed Cartesi interaction
        voucherLogger.logCartesiInteraction({
          voucherId: 'unknown',
          action: 'error',
          errorMessage: 'Failed to process payment request'
        });

        return {
          success: false,
          message: 'Failed to process payment request',
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Check voucher execution status from database
   * @param voucherId - Voucher ID to check
   * @returns Promise<IVoucherMonitoringResult>
   */
  async checkVoucherStatus(voucherId: string): Promise<IVoucherMonitoringResult> {
    try {
      const payment = await prisma.subscriptionPayment.findFirst({
        where: { voucherId }
      });

      if (!payment) {
        voucherLogger.logCartesiInteraction({
          voucherId,
          action: 'error',
          errorMessage: 'Voucher not found'
        });
        throw new ApiError(httpStatus.NOT_FOUND, 'Voucher not found');
      }

      // Log status check
      voucherLogger.logVoucherStatusUpdate({
        voucherId: payment.voucherId!,
        walletAddress: payment.walletAddress!,
        status: payment.status as 'pending' | 'executed' | 'failed',
        timestamp: new Date(),
        transactionHash: payment.transactionHash || undefined,
        amount: payment.amount?.toString(),
        metadata: { executedAt: payment.executedAt }
      });

      return {
        voucherId: payment.voucherId!,
        status: payment.status as 'pending' | 'executed' | 'failed',
        transactionHash: payment.transactionHash || undefined,
        executedAt: payment.executedAt || undefined,
      };
    } catch (error) {
      console.error('Error checking voucher status:', error);
      voucherLogger.logCartesiInteraction({
        voucherId,
        action: 'error',
        errorMessage: error instanceof Error ? error.message : 'Failed to check voucher status'
      });
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to check voucher status');
    }
  }

  /**
   * Get payment history for a wallet address
   * @param walletAddress - User's wallet address
   * @returns Promise<any[]>
   */
  async getPaymentHistory(walletAddress: string): Promise<any[]> {
    try {
      const payments = await prisma.subscriptionPayment.findMany({
        where: {
          walletAddress: walletAddress.toLowerCase()
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return payments;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get payment history');
    }
  }

  /**
   * Get pending vouchers for monitoring
   * @returns Promise<any[]>
   */
  async getPendingVouchers(): Promise<any[]> {
    try {
      const pendingPayments = await prisma.subscriptionPayment.findMany({
        where: {
          status: 'pending'
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Log pending vouchers query
      voucherLogger.logPaymentProcessing({
        voucherId: 'batch_query',
        walletAddress: 'system',
        amount: '0',
        method: 'get_pending_vouchers',
        transactionHash: `found_${pendingPayments.length}_pending`
      });

      return pendingPayments;
    } catch (error) {
      console.error('Error getting pending vouchers:', error);
      voucherLogger.logCartesiInteraction({
        voucherId: 'batch_query',
        action: 'error',
        errorMessage: error instanceof Error ? error.message : 'Failed to get pending vouchers'
      });
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get pending vouchers');
    }
  }

  /**
   * Get payment statistics
   * @returns Promise<any>
   */
  async getPaymentStatistics(): Promise<any> {
    try {
      const stats = await prisma.subscriptionPayment.groupBy({
        by: ['status'],
        _count: {
          status: true
        },
        _sum: {
          amount: true
        }
      });

      return {
        totalPayments: stats.reduce((acc, stat) => acc + stat._count.status, 0),
        totalAmount: stats.reduce((acc, stat) => acc + (stat._sum.amount || 0), 0),
        statusBreakdown: stats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count.status,
            amount: stat._sum.amount || 0
          };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>)
      };
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get payment statistics');
    }
  }
}

export default PaymentTrackingService;