import { Error_out, Log } from "cartesi-wallet";
import { VoucherMonitoringService, IVoucherExecution } from "../services/voucher.service";

interface IVoucherStatusUpdate {
  voucherId: string;
  status: 'executed' | 'failed';
  transactionHash?: string;
  failureReason?: string;
}

interface IVoucherStatusQuery {
  voucherId: string;
}

interface IWalletVoucherHistoryQuery {
  walletAddress: string;
}

class VoucherController {
  private voucherMonitoringService: VoucherMonitoringService;

  constructor() {
    this.voucherMonitoringService = new VoucherMonitoringService();
  }

  /**
   * Register a new voucher for monitoring
   */
  public registerVoucher(voucherData: {
    walletAddress: string;
    amount: number;
    voucherType: 'deposit' | 'withdrawal' | 'subscription_payment';
    transactionHash?: string;
  }) {
    if (!voucherData.walletAddress || !voucherData.amount || !voucherData.voucherType) {
      return new Error_out("Missing required fields: walletAddress, amount, or voucherType");
    }

    try {
      const voucherId = this.voucherMonitoringService.registerVoucher(voucherData);
      
      const response = {
        success: true,
        voucherId,
        message: "Voucher registered for monitoring",
        data: {
          voucherId,
          walletAddress: voucherData.walletAddress,
          amount: voucherData.amount,
          voucherType: voucherData.voucherType,
          status: 'pending'
        }
      };

      return new Log(JSON.stringify(response));
    } catch (error) {
      console.error("Error registering voucher:", error);
      return new Error_out("Failed to register voucher for monitoring");
    }
  }

  /**
   * Update voucher execution status
   */
  public updateVoucherStatus(updateData: IVoucherStatusUpdate) {
    if (!updateData.voucherId || !updateData.status) {
      return new Error_out("Missing required fields: voucherId or status");
    }

    if (updateData.status === 'executed' && !updateData.transactionHash) {
      return new Error_out("Transaction hash is required for executed vouchers");
    }

    if (updateData.status === 'failed' && !updateData.failureReason) {
      return new Error_out("Failure reason is required for failed vouchers");
    }

    try {
      const result = this.voucherMonitoringService.updateVoucherStatus(
        updateData.voucherId,
        updateData.status,
        updateData.transactionHash,
        updateData.failureReason
      );

      if (result instanceof Error_out) {
        return result;
      }

      const response = {
        success: true,
        message: `Voucher status updated to ${updateData.status}`,
        data: result
      };

      return new Log(JSON.stringify(response));
    } catch (error) {
      console.error("Error updating voucher status:", error);
      return new Error_out("Failed to update voucher status");
    }
  }

  /**
   * Get voucher execution status
   */
  public getVoucherStatus(queryData: IVoucherStatusQuery) {
    if (!queryData.voucherId) {
      return new Error_out("Missing required field: voucherId");
    }

    try {
      const result = this.voucherMonitoringService.getVoucherStatus(queryData.voucherId);

      if (result instanceof Error_out) {
        return result;
      }

      const response = {
        success: true,
        data: result
      };

      return new Log(JSON.stringify(response));
    } catch (error) {
      console.error("Error getting voucher status:", error);
      return new Error_out("Failed to get voucher status");
    }
  }

  /**
   * Get all pending vouchers
   */
  public getPendingVouchers() {
    try {
      const pendingVouchers = this.voucherMonitoringService.getPendingVouchers();
      
      const response = {
        success: true,
        count: pendingVouchers.length,
        data: pendingVouchers
      };

      return new Log(JSON.stringify(response));
    } catch (error) {
      console.error("Error getting pending vouchers:", error);
      return new Error_out("Failed to get pending vouchers");
    }
  }

  /**
   * Get voucher execution history for a wallet
   */
  public getWalletVoucherHistory(queryData: IWalletVoucherHistoryQuery) {
    if (!queryData.walletAddress) {
      return new Error_out("Missing required field: walletAddress");
    }

    try {
      const history = this.voucherMonitoringService.getWalletVoucherHistory(queryData.walletAddress);
      
      const response = {
        success: true,
        walletAddress: queryData.walletAddress,
        count: history.length,
        data: history
      };

      return new Log(JSON.stringify(response));
    } catch (error) {
      console.error("Error getting wallet voucher history:", error);
      return new Error_out("Failed to get wallet voucher history");
    }
  }

  /**
   * Get voucher execution statistics
   */
  public getVoucherStatistics() {
    try {
      const stats = this.voucherMonitoringService.getExecutionStatistics();
      return stats;
    } catch (error) {
      console.error("Error getting voucher statistics:", error);
      return new Error_out("Failed to get voucher statistics");
    }
  }

  /**
   * Clean up old voucher records
   */
  public cleanupOldVouchers() {
    try {
      const cleanedCount = this.voucherMonitoringService.cleanupOldVouchers();
      
      const response = {
        success: true,
        message: `Cleaned up ${cleanedCount} old voucher records`,
        cleanedCount
      };

      return new Log(JSON.stringify(response));
    } catch (error) {
      console.error("Error cleaning up old vouchers:", error);
      return new Error_out("Failed to clean up old vouchers");
    }
  }
}

export { VoucherController };