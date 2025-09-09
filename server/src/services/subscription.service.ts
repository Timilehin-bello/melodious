import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import logger from "../configs/logger";

const prisma = new PrismaClient();

type Subscription = NonNullable<
  Awaited<ReturnType<typeof prisma.subscription.findUnique>>
>;
type SubscriptionPayment = NonNullable<
  Awaited<ReturnType<typeof prisma.subscriptionPayment.findUnique>>
>;
type SubscriptionPlan = NonNullable<
  Awaited<ReturnType<typeof prisma.subscriptionPlan.findUnique>>
>;

interface CreateSubscriptionData {
  userId: number;
  planType: string;
  paymentMethod: string;
  paymentId: string;
  autoRenew?: boolean;
}

interface ProcessPaymentData {
  subscriptionId: number;
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentId: string;
  paymentData?: any;
}

interface ProcessVoucherExecutionData {
  subscriptionId: number;
  paymentId: string;
  transactionHash: string;
}

interface UpdateSubscriptionData {
  status?: string;
  autoRenew?: boolean;
  cancelReason?: string;
}

/**
 * Get subscription plan by name
 * @param {string} planName
 * @returns {Promise<SubscriptionPlan>}
 */
const getSubscriptionPlan = async (
  planName: string
): Promise<SubscriptionPlan> => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { name: planName, isActive: true },
  });

  if (!plan) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Subscription plan '${planName}' not found`
    );
  }

  return plan as SubscriptionPlan;
};

/**
 * Create a new subscription
 * @param {CreateSubscriptionData} subscriptionData
 * @returns {Promise<Subscription>}
 */
const createSubscription = async (
  subscriptionData: CreateSubscriptionData
): Promise<Subscription> => {
  const {
    userId,
    planType,
    paymentMethod,
    paymentId,
    autoRenew = true,
  } = subscriptionData;

  try {
    // Get subscription plan details
    const plan = await getSubscriptionPlan(planType);

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "User already has an active subscription"
      );
    }

    // Calculate end date based on plan duration
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000
    );

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planType,
        startDate,
        endDate,
        price: plan.price,
        currency: plan.currency,
        paymentMethod,
        paymentId,
        autoRenew,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
          },
        },
      },
    });

    logger.info(`Subscription created for user ${userId}`, {
      subscriptionId: subscription.id,
    });
    return subscription;
  } catch (error) {
    logger.error("Error creating subscription:", error);
    throw error;
  }
};

/**
 * Process subscription payment
 * @param {ProcessPaymentData} paymentData
 * @returns {Promise<SubscriptionPayment>}
 */
const processPayment = async (
  paymentData: ProcessPaymentData
): Promise<SubscriptionPayment> => {
  const {
    subscriptionId,
    amount,
    currency = "CTSI",
    paymentMethod,
    paymentId,
    paymentData: additionalData,
  } = paymentData;

  try {
    // Verify subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    // Create payment record
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId,
        amount,
        currency,
        paymentMethod,
        paymentId,
        paymentData: additionalData ? JSON.stringify(additionalData) : null,
        status: "COMPLETED",
        processedAt: new Date(),
      },
    });

    // Update subscription status to ACTIVE
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "ACTIVE" },
    });

    logger.info(`Payment processed for subscription ${subscriptionId}`, {
      paymentId: payment.id,
    });
    return payment;
  } catch (error) {
    logger.error("Error processing payment:", error);
    throw error;
  }
};

/**
 * Get subscription by ID
 * @param {number} subscriptionId
 * @returns {Promise<Subscription>}
 */
const getSubscriptionById = async (
  subscriptionId: number
): Promise<Subscription> => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          walletAddress: true,
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
  }

  return subscription;
};

/**
 * Get user subscriptions
 * @param {number} userId
 * @param {object} options
 * @returns {Promise<Subscription[]>}
 */
const getUserSubscriptions = async (
  userId: number,
  options: { status?: string; limit?: number; offset?: number } = {}
): Promise<{ subscriptions: Subscription[]; total: number }> => {
  const { status, limit = 10, offset = 0 } = options;

  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.subscription.count({ where }),
  ]);

  return { subscriptions, total };
};

/**
 * Update subscription
 * @param {number} subscriptionId
 * @param {UpdateSubscriptionData} updateData
 * @returns {Promise<Subscription>}
 */
const updateSubscription = async (
  subscriptionId: number,
  updateData: UpdateSubscriptionData
): Promise<Subscription> => {
  const { status, autoRenew, cancelReason } = updateData;

  try {
    const updatePayload: any = {};

    if (status !== undefined) {
      updatePayload.status = status;
      if (status === "CANCELLED") {
        updatePayload.cancelledAt = new Date();
        if (cancelReason) {
          updatePayload.cancelReason = cancelReason;
        }
      }
    }

    if (autoRenew !== undefined) {
      updatePayload.autoRenew = autoRenew;
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updatePayload,
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
          },
        },
      },
    });

    logger.info(`Subscription ${subscriptionId} updated`, {
      status,
      autoRenew,
    });
    return subscription;
  } catch (error) {
    logger.error("Error updating subscription:", error);
    throw error;
  }
};

/**
 * Get all subscription plans
 * @returns {Promise<SubscriptionPlan[]>}
 */
const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
};

/**
 * Create subscription plan
 * @param {object} planData
 * @returns {Promise<SubscriptionPlan>}
 */
const createSubscriptionPlan = async (planData: {
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency?: string;
  duration: number;
  features: any;
}): Promise<SubscriptionPlan> => {
  const {
    name,
    displayName,
    description,
    price,
    currency = "CTSI",
    duration,
    features,
  } = planData;

  try {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        displayName,
        description,
        price,
        currency,
        duration,
        features: JSON.stringify(features),
      },
    });

    logger.info(`Subscription plan created: ${name}`, { planId: plan.id });
    return plan;
  } catch (error) {
    logger.error("Error creating subscription plan:", error);
    throw error;
  }
};

/**
 * Process voucher execution for subscription activation
 * @param {ProcessVoucherExecutionData} voucherData
 * @returns {Promise<SubscriptionPayment>}
 */
const processVoucherExecution = async (
  voucherData: ProcessVoucherExecutionData
): Promise<SubscriptionPayment> => {
  const { subscriptionId, paymentId, transactionHash } = voucherData;

  try {
    // Verify subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    // Get subscription plan details for payment amount
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { name: subscription.planType },
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription plan not found");
    }

    // Create payment record for voucher execution
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod: "CRYPTO",
        paymentId,
        paymentData: JSON.stringify({ transactionHash }),
        status: "COMPLETED",
        processedAt: new Date(),
      },
    });

    // Update subscription status to ACTIVE
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000), // Add duration in days
      },
    });

    logger.info(`Voucher executed for subscription ${subscriptionId}`, {
      paymentId: payment.id,
      transactionHash,
    });

    return payment;
  } catch (error) {
    logger.error("Error processing voucher execution:", error);
    throw error;
  }
};

export {
  getSubscriptionPlan,
  createSubscription,
  processPayment,
  processVoucherExecution,
  getSubscriptionById,
  getUserSubscriptions,
  updateSubscription,
  getSubscriptionPlans,
  createSubscriptionPlan,
};
