import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { paymentTrackingService } from '../services';

/**
 * Process payment request (similar to sendTransactionRequest)
 */
const processPaymentRequest = catchAsync(async (req: Request, res: Response) => {
  // Call the paymentTrackingService to process payment
  const result = await paymentTrackingService.processPaymentRequest(req.body);

  // Return the payment processing result
  res.status(httpStatus.OK).send({
    status: "success",
    message: "Payment request processed successfully",
    data: result,
  });
});

/**
 * Get voucher status
 */
const getVoucherStatus = catchAsync(async (req: Request, res: Response) => {
  const { voucherId } = req.params;
  const status = await paymentTrackingService.checkVoucherStatus(voucherId);

  res.status(httpStatus.OK).json({
    status: 'success',
    data: status
  });
});

/**
 * Get payment history for a wallet
 */
const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const history = await paymentTrackingService.getPaymentHistory(walletAddress);

  res.status(httpStatus.OK).json({
    status: 'success',
    data: history
  });
});

/**
 * Get pending vouchers
 */
const getPendingVouchers = catchAsync(async (req: Request, res: Response) => {
  const pendingVouchers = await paymentTrackingService.getPendingVouchers();

  res.status(httpStatus.OK).json({
    status: 'success',
    data: pendingVouchers
  });
});

/**
 * Get payment statistics
 */
const getPaymentStatistics = catchAsync(async (req: Request, res: Response) => {
  const statistics = await paymentTrackingService.getPaymentStatistics();

  res.status(httpStatus.OK).json({
    status: 'success',
    data: statistics
  });
});

/**
 * Health check endpoint
 */
const healthCheck = catchAsync(async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Payment tracking service is healthy',
    timestamp: new Date().toISOString()
  });
});

export {
  processPaymentRequest,
  getVoucherStatus,
  getPaymentHistory,
  getPendingVouchers,
  getPaymentStatistics,
  healthCheck,
};