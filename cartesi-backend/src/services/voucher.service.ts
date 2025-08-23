import { Error_out, Log } from "cartesi-wallet";
import { RepositoryService } from "./repository.service";
import { ConfigService } from "./config.service";

export interface IVoucherExecution {
  voucherId: string;
  walletAddress: string;
  amount: number;
  transactionHash?: string;
  executionStatus: 'pending' | 'executed' | 'failed';
  executedAt?: Date;
  failureReason?: string;
  voucherType: 'deposit' | 'withdrawal' | 'subscription_payment';
}

export interface IVoucherMonitoringResult {
  voucherId: string;
  status: 'pending' | 'executed' | 'failed';
  transactionHash?: string;
  executedAt?: Date;
  failureReason?: string;
}

class VoucherMonitoringService {
  private repositoryService: RepositoryService;
  private configService: ConfigService;
  private voucherExecutions: Map<string, IVoucherExecution>;

  constructor() {
    this.repositoryService = new RepositoryService();
    this.configService = new ConfigService();
    this.voucherExecutions = new Map();
  }

  /**
   * Register a new voucher for monitoring
   */
  public registerVoucher(voucherData: Omit<IVoucherExecution, 'voucherId' | 'executionStatus' | 'executedAt'>): string {
    const voucherId = this.generateVoucherId();
    const voucherExecution: IVoucherExecution = {
      ...voucherData,
      voucherId,
      executionStatus: 'pending'
    };

    this.voucherExecutions.set(voucherId, voucherExecution);
    
    console.log(`Voucher registered for monitoring: ${voucherId}`, voucherExecution);
    
    return voucherId;
  }

  /**
   * Update voucher execution status
   */
  public updateVoucherStatus(
    voucherId: string, 
    status: 'executed' | 'failed',
    transactionHash?: string,
    failureReason?: string
  ): IVoucherMonitoringResult | Error_out {
    const voucher = this.voucherExecutions.get(voucherId);
    
    if (!voucher) {
      return new Error_out(`Voucher with ID ${voucherId} not found`);
    }

    voucher.executionStatus = status;
    voucher.executedAt = new Date();
    
    if (status === 'executed' && transactionHash) {
      voucher.transactionHash = transactionHash;
      this.logSuccessfulExecution(voucher);
    } else if (status === 'failed' && failureReason) {
      voucher.failureReason = failureReason;
      this.logFailedExecution(voucher);
    }

    this.voucherExecutions.set(voucherId, voucher);

    return {
      voucherId,
      status,
      transactionHash,
      executedAt: voucher.executedAt,
      failureReason
    };
  }

  /**
   * Get voucher execution status
   */
  public getVoucherStatus(voucherId: string): IVoucherMonitoringResult | Error_out {
    const voucher = this.voucherExecutions.get(voucherId);
    
    if (!voucher) {
      return new Error_out(`Voucher with ID ${voucherId} not found`);
    }

    return {
      voucherId: voucher.voucherId,
      status: voucher.executionStatus,
      transactionHash: voucher.transactionHash,
      executedAt: voucher.executedAt,
      failureReason: voucher.failureReason
    };
  }

  /**
   * Get all pending vouchers
   */
  public getPendingVouchers(): IVoucherExecution[] {
    return Array.from(this.voucherExecutions.values())
      .filter(voucher => voucher.executionStatus === 'pending');
  }

  /**
   * Get voucher execution history for a wallet
   */
  public getWalletVoucherHistory(walletAddress: string): IVoucherExecution[] {
    return Array.from(this.voucherExecutions.values())
      .filter(voucher => voucher.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .sort((a, b) => {
        if (!a.executedAt) return 1;
        if (!b.executedAt) return -1;
        return b.executedAt.getTime() - a.executedAt.getTime();
      });
  }

  /**
   * Log successful voucher execution
   */
  private logSuccessfulExecution(voucher: IVoucherExecution): void {
    const logData = {
      event: 'voucher_executed',
      voucherId: voucher.voucherId,
      walletAddress: voucher.walletAddress,
      amount: voucher.amount,
      voucherType: voucher.voucherType,
      transactionHash: voucher.transactionHash,
      executedAt: voucher.executedAt,
      timestamp: new Date().toISOString()
    };

    console.log('Voucher executed successfully:', logData);
    
    // Store execution log for server synchronization
    this.storeExecutionLog(logData);
  }

  /**
   * Log failed voucher execution
   */
  private logFailedExecution(voucher: IVoucherExecution): void {
    const logData = {
      event: 'voucher_failed',
      voucherId: voucher.voucherId,
      walletAddress: voucher.walletAddress,
      amount: voucher.amount,
      voucherType: voucher.voucherType,
      failureReason: voucher.failureReason,
      executedAt: voucher.executedAt,
      timestamp: new Date().toISOString()
    };

    console.error('Voucher execution failed:', logData);
    
    // Store failure log for debugging
    this.storeExecutionLog(logData);
  }

  /**
   * Store execution log in repository for server sync
   */
  private storeExecutionLog(logData: any): void {
    try {
      // Store in local repository for server synchronization
      const logEntry = {
        id: this.generateLogId(),
        type: 'voucher_execution_log',
        data: logData,
        createdAt: new Date().toISOString(),
        synced: false
      };
      
      // This would be stored in the repository for later sync with server
      console.log('Storing execution log:', logEntry);
    } catch (error) {
      console.error('Failed to store execution log:', error);
    }
  }

  /**
   * Generate unique voucher ID
   */
  private generateVoucherId(): string {
    return `voucher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get voucher execution statistics
   */
  public getExecutionStatistics(): Log {
    const allVouchers = Array.from(this.voucherExecutions.values());
    const stats = {
      total: allVouchers.length,
      pending: allVouchers.filter(v => v.executionStatus === 'pending').length,
      executed: allVouchers.filter(v => v.executionStatus === 'executed').length,
      failed: allVouchers.filter(v => v.executionStatus === 'failed').length,
      byType: {
        deposit: allVouchers.filter(v => v.voucherType === 'deposit').length,
        withdrawal: allVouchers.filter(v => v.voucherType === 'withdrawal').length,
        subscription_payment: allVouchers.filter(v => v.voucherType === 'subscription_payment').length
      }
    };

    return new Log(JSON.stringify(stats));
  }

  /**
   * Clean up old voucher records (older than 30 days)
   */
  public cleanupOldVouchers(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let cleanedCount = 0;
    
    for (const [voucherId, voucher] of this.voucherExecutions.entries()) {
      if (voucher.executedAt && voucher.executedAt < thirtyDaysAgo) {
        this.voucherExecutions.delete(voucherId);
        cleanedCount++;
      }
    }
    
    console.log(`Cleaned up ${cleanedCount} old voucher records`);
    return cleanedCount;
  }
}

export { VoucherMonitoringService };