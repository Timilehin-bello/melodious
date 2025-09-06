import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { subscriptionService } from "../services";
import ApiError from "../utils/ApiError";
import logger from "../configs/logger";

/**
 * Create a new subscription
 */
const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const { planType, paymentMethod, paymentId, autoRenew } = req.body;
  const userId = (req.user as any)?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const subscription = await subscriptionService.createSubscription({
    userId,
    planType,
    paymentMethod,
    paymentId,
    autoRenew,
  });

  logger.info(`Subscription created for user ${userId}`, {
    subscriptionId: subscription.id,
  });

  res.status(httpStatus.CREATED).json({
    status: "success",
    message: "Subscription created successfully",
    data: subscription,
  });
});

/**
 * Process subscription payment
 */
const processPayment = catchAsync(async (req: Request, res: Response) => {
  const {
    subscriptionId,
    amount,
    currency,
    paymentMethod,
    paymentId,
    paymentData,
  } = req.body;

  const payment = await subscriptionService.processPayment({
    subscriptionId,
    amount,
    currency,
    paymentMethod,
    paymentId,
    paymentData,
  });

  logger.info(`Payment processed for subscription ${subscriptionId}`, {
    paymentId: payment.id,
  });

  res.status(httpStatus.OK).json({
    status: "success",
    message: "Payment processed successfully",
    data: payment,
  });
});

/**
 * Get subscription by ID
 */
const getSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const userId = (req.user as any)?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const subscription = await subscriptionService.getSubscriptionById(
    parseInt(subscriptionId)
  );

  // Ensure user can only access their own subscriptions
  if (subscription.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Access denied to this subscription"
    );
  }

  res.status(httpStatus.OK).json({
    status: "success",
    data: subscription,
  });
});

/**
 * Get user subscriptions
 */
const getUserSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id;
  const { status, limit, offset } = req.query;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const result = await subscriptionService.getUserSubscriptions(userId, {
    status: status as string,
    limit: limit ? parseInt(limit as string) : undefined,
    offset: offset ? parseInt(offset as string) : undefined,
  });

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      subscriptions: result.subscriptions,
      total: result.total,
      limit: limit ? parseInt(limit as string) : 10,
      offset: offset ? parseInt(offset as string) : 0,
    },
  });
});

/**
 * Update subscription
 */
const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { status, autoRenew, cancelReason } = req.body;
  const userId = (req.user as any)?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // First verify the subscription belongs to the user
  const existingSubscription = await subscriptionService.getSubscriptionById(
    parseInt(subscriptionId)
  );
  if (existingSubscription.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Access denied to this subscription"
    );
  }

  const subscription = await subscriptionService.updateSubscription(
    parseInt(subscriptionId),
    {
      status,
      autoRenew,
      cancelReason,
    }
  );

  logger.info(`Subscription ${subscriptionId} updated by user ${userId}`, {
    status,
    autoRenew,
  });

  res.status(httpStatus.OK).json({
    status: "success",
    message: "Subscription updated successfully",
    data: subscription,
  });
});

/**
 * Get all subscription plans
 */
const getSubscriptionPlans = catchAsync(async (req: Request, res: Response) => {
  const plans = await subscriptionService.getSubscriptionPlans();

  res.status(httpStatus.OK).json({
    status: "success",
    data: plans,
  });
});

/**
 * Create subscription plan (Admin only)
 */
const createSubscriptionPlan = catchAsync(
  async (req: Request, res: Response) => {
    const {
      name,
      displayName,
      description,
      price,
      currency,
      duration,
      features,
    } = req.body;

    const plan = await subscriptionService.createSubscriptionPlan({
      name,
      displayName,
      description,
      price,
      currency,
      duration,
      features,
    });

    logger.info(`Subscription plan created: ${name}`, { planId: plan.id });

    res.status(httpStatus.CREATED).json({
      status: "success",
      message: "Subscription plan created successfully",
      data: plan,
    });
  }
);

/**
 * Process voucher execution for subscription activation
 */
const processVoucherExecution = catchAsync(
  async (req: Request, res: Response) => {
    const { subscriptionId, paymentId, transactionHash } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    // Verify subscription belongs to the user
    const subscription = await subscriptionService.getSubscriptionById(
      subscriptionId
    );
    if (subscription.userId !== userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access denied to this subscription"
      );
    }

    // Process voucher execution and activate subscription
    const result = await subscriptionService.processVoucherExecution({
      subscriptionId,
      paymentId,
      transactionHash,
    });

    logger.info(`Voucher executed for subscription ${subscriptionId}`, {
      paymentId,
      transactionHash,
    });

    res.status(httpStatus.OK).json({
      status: "success",
      message: "Voucher executed and subscription activated successfully",
      data: result,
    });
  }
);

export {
  createSubscription,
  processPayment,
  processVoucherExecution,
  getSubscription,
  getUserSubscriptions,
  updateSubscription,
  getSubscriptionPlans,
  createSubscriptionPlan,
};
