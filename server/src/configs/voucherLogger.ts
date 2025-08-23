import winston, { Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "./config";

interface VoucherLogData {
  voucherId: string;
  walletAddress: string;
  amount?: string;
  status: 'pending' | 'executed' | 'failed';
  transactionHash?: string;
  timestamp: Date;
  executionTime?: number;
  errorMessage?: string;
  metadata?: any;
}

class VoucherLogger {
  private logger: Logger;

  constructor() {
    const voucherTransport = new DailyRotateFile({
      filename: config.logConfig.logFolder + 'voucher-%DATE%.log',
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30", // Keep voucher logs for 30 days
    });

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        voucherTransport,
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  logVoucherCreated(data: Omit<VoucherLogData, 'status' | 'timestamp'>) {
    this.logger.info('Voucher created', {
      ...data,
      status: 'pending',
      timestamp: new Date(),
      event: 'voucher_created'
    });
  }

  logVoucherExecuted(data: Omit<VoucherLogData, 'status' | 'timestamp'>) {
    this.logger.info('Voucher executed successfully', {
      ...data,
      status: 'executed',
      timestamp: new Date(),
      event: 'voucher_executed'
    });
  }

  logVoucherFailed(data: Omit<VoucherLogData, 'status' | 'timestamp'>) {
    this.logger.error('Voucher execution failed', {
      ...data,
      status: 'failed',
      timestamp: new Date(),
      event: 'voucher_failed'
    });
  }

  logVoucherStatusUpdate(data: VoucherLogData) {
    this.logger.info('Voucher status updated', {
      ...data,
      timestamp: new Date(),
      event: 'voucher_status_update'
    });
  }

  logPaymentProcessing(data: {
    voucherId: string;
    walletAddress: string;
    amount: string;
    method: string;
    transactionHash?: string;
  }) {
    this.logger.info('Payment processing initiated', {
      ...data,
      timestamp: new Date(),
      event: 'payment_processing'
    });
  }

  logCartesiInteraction(data: {
    voucherId: string;
    action: 'submit' | 'confirm' | 'error';
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: string;
    errorMessage?: string;
  }) {
    const level = data.action === 'error' ? 'error' : 'info';
    this.logger.log(level, `Cartesi interaction: ${data.action}`, {
      ...data,
      timestamp: new Date(),
      event: 'cartesi_interaction'
    });
  }

  // Query methods for analytics
  async getVoucherStats(timeRange: { start: Date; end: Date }) {
    // This would typically query log files or a log aggregation service
    // For now, we'll just log the request
    this.logger.info('Voucher statistics requested', {
      timeRange,
      timestamp: new Date(),
      event: 'stats_request'
    });
  }
}

export const voucherLogger = new VoucherLogger();
export default voucherLogger;
export type { VoucherLogData };