import httpStatus from "http-status";
import { subscriptionService, subscriptionPaymentService } from "../services";
import * as voucherSubscriptionService from "../services/voucherSubscription.service";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/ApiError";

/**
 * Initialize default subscription plans
 */
const initializeDefaultPlans = catchAsync(async (req: any, res: any) => {
  const plans = await subscriptionService.initializeDefaultPlans();

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Default subscription plans initialized",
    data: plans,
  });
});

/**
 * Create a new subscription plan
 */
const createSubscriptionPlan = catchAsync(async (req: any, res: any) => {
  const { name, level, price, duration, features } = req.body;

  const plan = await subscriptionService.createSubscriptionPlan({
    name,
    level,
    price,
    duration,
    features,
  });

  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "Subscription plan created successfully",
    data: plan,
  });
});

/**
 * Get all subscription plans
 */
const getSubscriptionPlans = catchAsync(async (req: any, res: any) => {
  const activeOnly = req.query.activeOnly !== "false";
  const plans = await subscriptionService.getSubscriptionPlans(activeOnly);

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Subscription plans retrieved successfully",
    data: plans,
  });
});

/**
 * Get subscription plan by ID
 */
const getSubscriptionPlan = catchAsync(async (req: any, res: any) => {
  const { planId } = req.params;
  const plan = await subscriptionService.getSubscriptionPlanById(
    parseInt(planId)
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Subscription plan retrieved successfully",
    data: plan,
  });
});

/**
 * Create a new subscription
 */
const createSubscription = catchAsync(async (req: any, res: any) => {
  const { listenerId, planId, autoRenew } = req.body;

  const subscription = await subscriptionService.createSubscription({
    listenerId,
    planId,
    autoRenew,
  });

  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "Subscription created successfully",
    data: subscription,
  });
});

/**
 * Get subscription by ID
 */
const getSubscription = catchAsync(async (req: any, res: any) => {
  const { subscriptionId } = req.params;
  const subscription = await subscriptionService.getSubscriptionById(
    subscriptionId
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Subscription retrieved successfully",
    data: subscription,
  });
});

/**
 * Get active subscription for a listener
 */
const getActiveSubscription = catchAsync(async (req: any, res: any) => {
  const { listenerId } = req.params;
  const subscription = await subscriptionService.getActiveSubscription(
    parseInt(listenerId)
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: subscription
      ? "Active subscription found"
      : "No active subscription",
    data: subscription,
  });
});

/**
 * Get all subscriptions for a listener
 */
const getListenerSubscriptions = catchAsync(async (req: any, res: any) => {
  const { listenerId } = req.params;
  const subscriptions = await subscriptionService.getSubscriptionsByListener(
    parseInt(listenerId)
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Listener subscriptions retrieved successfully",
    data: subscriptions,
  });
});

/**
 * Cancel a subscription
 */
const cancelSubscription = catchAsync(async (req: any, res: any) => {
  const { subscriptionId } = req.params;
  const subscription = await subscriptionService.cancelSubscription(
    subscriptionId
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Subscription cancelled successfully",
    data: subscription,
  });
});

/**
 * Renew a subscription
 */
const renewSubscription = catchAsync(async (req: any, res: any) => {
  const { subscriptionId } = req.params;
  const subscription = await subscriptionService.renewSubscription(
    subscriptionId
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Subscription renewed successfully",
    data: subscription,
  });
});

/**
 * Process subscription payment
 */
const processSubscriptionPayment = catchAsync(async (req: any, res: any) => {
  const {
    listenerId,
    planId,
    amount,
    currency,
    transactionHash,
    vaultDepositId,
  } = req.body;

  const payment = await subscriptionPaymentService.createSubscriptionPayment({
    listenerId,
    planId,
    amount,
    currency,
    transactionHash,
    vaultDepositId,
  });

  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "Subscription payment created successfully",
    data: payment,
  });
});

/**
 * Create voucher-based subscription
 */
const createVoucherSubscription = catchAsync(async (req: any, res: any) => {
  const {
    listenerId,
    planId,
    walletAddress,
    amount,
    voucherId,
    autoRenew,
  } = req.body;

  const result = await voucherSubscriptionService.createVoucherSubscription({
    listenerId,
    planId,
    walletAddress,
    amount,
    voucherId,
    autoRenew,
  });

  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "Voucher subscription created successfully",
    data: result,
  });
});

/**
 * Activate voucher subscription
 */
const activateVoucherSubscription = catchAsync(async (req: any, res: any) => {
  const { voucherId, transactionHash } = req.body;

  const subscription = await voucherSubscriptionService.activateVoucherSubscription({
    voucherId,
    transactionHash,
  });

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Voucher subscription activated successfully",
    data: subscription,
  });
});

/**
 * Cancel voucher subscription
 */
const cancelVoucherSubscription = catchAsync(async (req: any, res: any) => {
  const { voucherId } = req.params;
  const { reason } = req.body;

  const subscription = await voucherSubscriptionService.cancelVoucherSubscription(
    voucherId,
    reason
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Voucher subscription cancelled successfully",
    data: subscription,
  });
});

/**
 * Get subscription by voucher
 */
const getSubscriptionByVoucher = catchAsync(async (req: any, res: any) => {
  const { voucherId } = req.params;

  const result = await voucherSubscriptionService.getSubscriptionByVoucher(voucherId);

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Subscription retrieved successfully",
    data: result,
  });
});

/**
 * Process voucher payment request
 */
const processVoucherPaymentRequest = catchAsync(async (req: any, res: any) => {
  const { message, signer, signature } = req.body;

  const result = await voucherSubscriptionService.processVoucherPaymentRequest({
    message,
    signer,
    signature,
  });

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Voucher payment request processed successfully",
    data: result,
  });
});

/**
 * Confirm subscription payment
 */
const confirmSubscriptionPayment = catchAsync(async (req: any, res: any) => {
  const { paymentId } = req.params;
  const { transactionHash } = req.body;

  const result = await subscriptionPaymentService.confirmPayment(
    paymentId,
    transactionHash
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Payment confirmed successfully",
    data: result,
  });
});

/**
 * Get payment by ID
 */
const getPayment = catchAsync(async (req: any, res: any) => {
  const { paymentId } = req.params;
  const payment = await subscriptionPaymentService.getPaymentById(paymentId);

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Payment retrieved successfully",
    data: payment,
  });
});

/**
 * Get payments by listener
 */
const getListenerPayments = catchAsync(async (req: any, res: any) => {
  const { listenerId } = req.params;
  const payments = await subscriptionPaymentService.getPaymentsByListener(
    parseInt(listenerId)
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Listener payments retrieved successfully",
    data: payments,
  });
});

/**
 * Monitor vault deposit
 */
const monitorVaultDeposit = catchAsync(async (req: any, res: any) => {
  const { vaultDepositId } = req.params;
  const result = await subscriptionPaymentService.monitorVaultDeposit(
    vaultDepositId
  );

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Vault deposit status retrieved",
    data: result,
  });
});

/**
 * Get expired subscriptions
 */
const getExpiredSubscriptions = catchAsync(async (req: any, res: any) => {
  const expiredSubscriptions =
    await subscriptionService.getExpiredSubscriptions();

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Expired subscriptions retrieved successfully",
    data: expiredSubscriptions,
  });
});

/**
 * Process expired subscriptions (admin only)
 */
const processExpiredSubscriptions = catchAsync(async (req: any, res: any) => {
  const processedCount =
    await subscriptionService.processExpiredSubscriptions();

  res.status(httpStatus.OK).send({
    status: "success",
    message: `Processed ${processedCount} expired subscriptions`,
    data: { processedCount },
  });
});

export {
  initializeDefaultPlans,
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlan,
  createSubscription,
  getSubscription,
  getActiveSubscription,
  getListenerSubscriptions,
  cancelSubscription,
  renewSubscription,
  processSubscriptionPayment,
  confirmSubscriptionPayment,
  getPayment,
  getListenerPayments,
  monitorVaultDeposit,
  getExpiredSubscriptions,
  processExpiredSubscriptions,
  createVoucherSubscription,
  activateVoucherSubscription,
  cancelVoucherSubscription,
  getSubscriptionByVoucher,
  processVoucherPaymentRequest,
};
