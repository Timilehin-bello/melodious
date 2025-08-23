import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { prisma } from ".";
import { SubscriptionPlan, UserSubscription, Listener } from "@prisma/client";

// Interface for creating subscription plan
export interface ICreateSubscriptionPlan {
  name: string;
  level: string;
  price: number;
  duration: number;
  features: Record<string, any>;
}

// Interface for subscription creation
export interface ICreateSubscription {
  listenerId: number;
  planId: number;
  autoRenew?: boolean;
}

/**
 * Initialize default subscription plans
 * @returns Array of created subscription plans
 */
const initializeDefaultPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    // Check if plans already exist
    const existingPlans = await prisma.subscriptionPlan.findMany();
    if (existingPlans.length > 0) {
      return existingPlans;
    }

    // Create default plans
    const defaultPlans = [
      {
        name: "Free Plan",
        level: "FREE",
        price: 0,
        duration: 365, // 1 year
        features: {
          maxSkips: 6,
          adsEnabled: true,
          audioQuality: "standard",
          offlineDownloads: false,
          playlistLimit: 5,
        },
      },
      {
        name: "Premium Plan",
        level: "PREMIUM",
        price: 0.01, // 0.01 ETH per month
        duration: 30, // 30 days
        features: {
          maxSkips: -1, // unlimited
          adsEnabled: false,
          audioQuality: "high",
          offlineDownloads: true,
          playlistLimit: -1, // unlimited
        },
      },
    ];

    const createdPlans = await Promise.all(
      defaultPlans.map((plan) =>
        prisma.subscriptionPlan.create({
          data: plan,
        })
      )
    );

    return createdPlans;
  } catch (error) {
    console.error("Error initializing default plans:", error);
    throw error;
  }
};

/**
 * Create a new subscription plan
 * @param planData - Subscription plan data
 * @returns Created subscription plan
 */
const createSubscriptionPlan = async (
  planData: ICreateSubscriptionPlan
): Promise<SubscriptionPlan> => {
  try {
    // Check if plan with same name already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: planData.name },
    });

    if (existingPlan) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Subscription plan with this name already exists"
      );
    }

    const plan = await prisma.subscriptionPlan.create({
      data: planData,
    });

    return plan;
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    throw error;
  }
};

/**
 * Get all subscription plans
 * @param activeOnly - Whether to return only active plans
 * @returns Array of subscription plans
 */
const getSubscriptionPlans = async (
  activeOnly: boolean = true
): Promise<SubscriptionPlan[]> => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { price: "asc" },
    });

    return plans;
  } catch (error) {
    console.error("Error getting subscription plans:", error);
    throw error;
  }
};

/**
 * Get subscription plan by ID
 * @param planId - Plan ID
 * @returns Subscription plan
 */
const getSubscriptionPlanById = async (
  planId: number
): Promise<SubscriptionPlan> => {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription plan not found");
    }

    return plan;
  } catch (error) {
    console.error("Error getting subscription plan:", error);
    throw error;
  }
};

/**
 * Create a new user subscription
 * @param subscriptionData - Subscription data
 * @returns Created subscription
 */
const createSubscription = async (
  subscriptionData: ICreateSubscription
): Promise<UserSubscription> => {
  try {
    // Verify listener exists
    const listener = await prisma.listener.findUnique({
      where: { id: subscriptionData.listenerId },
    });

    if (!listener) {
      throw new ApiError(httpStatus.NOT_FOUND, "Listener not found");
    }

    // Verify plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionData.planId },
    });

    if (!plan) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription plan not found");
    }

    // Check for existing active subscription
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        listenerId: subscriptionData.listenerId,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "User already has an active subscription"
      );
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    const subscription = await prisma.userSubscription.create({
      data: {
        listenerId: subscriptionData.listenerId,
        planId: subscriptionData.planId,
        status: "PENDING",
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

    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

/**
 * Get user subscription by ID
 * @param subscriptionId - Subscription ID
 * @returns User subscription with details
 */
const getSubscriptionById = async (subscriptionId: string) => {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        listener: {
          include: {
            user: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    return subscription;
  } catch (error) {
    console.error("Error getting subscription:", error);
    throw error;
  }
};

/**
 * Get active subscription for a listener
 * @param listenerId - Listener ID
 * @returns Active subscription or null
 */
const getActiveSubscription = async (listenerId: number) => {
  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        listenerId,
        status: "ACTIVE",
        endDate: {
          gt: new Date(),
        },
      },
      include: {
        plan: true,
        payments: {
          where: {
            status: "COMPLETED",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return subscription;
  } catch (error) {
    console.error("Error getting active subscription:", error);
    throw error;
  }
};

/**
 * Get all subscriptions for a listener
 * @param listenerId - Listener ID
 * @returns Array of subscriptions
 */
const getSubscriptionsByListener = async (listenerId: number) => {
  try {
    const subscriptions = await prisma.userSubscription.findMany({
      where: { listenerId },
      include: {
        plan: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return subscriptions;
  } catch (error) {
    console.error("Error getting subscriptions by listener:", error);
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param subscriptionId - Subscription ID
 * @returns Updated subscription
 */
const cancelSubscription = async (
  subscriptionId: string
): Promise<UserSubscription> => {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        listener: true,
      },
    });

    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    if (subscription.status === "CANCELLED") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Subscription is already cancelled"
      );
    }

    // Update subscription status
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELLED",
        autoRenew: false,
      },
    });

    // Update listener subscription level to FREE
    await prisma.listener.update({
      where: { id: subscription.listenerId },
      data: {
        subscriptionLevel: "FREE",
      },
    });

    return updatedSubscription;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

/**
 * Renew a subscription
 * @param subscriptionId - Subscription ID
 * @returns Updated subscription
 */
const renewSubscription = async (
  subscriptionId: string
): Promise<UserSubscription> => {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    // Calculate new end date
    const currentEndDate = subscription.endDate;
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + subscription.plan.duration);

    // Update subscription
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        endDate: newEndDate,
      },
    });

    return updatedSubscription;
  } catch (error) {
    console.error("Error renewing subscription:", error);
    throw error;
  }
};

/**
 * Get expired subscriptions
 * @returns Array of expired subscriptions
 */
const getExpiredSubscriptions = async () => {
  try {
    const expiredSubscriptions = await prisma.userSubscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: new Date(),
        },
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

    return expiredSubscriptions;
  } catch (error) {
    console.error("Error getting expired subscriptions:", error);
    throw error;
  }
};

/**
 * Process expired subscriptions
 * @returns Number of processed subscriptions
 */
const processExpiredSubscriptions = async (): Promise<number> => {
  try {
    const expiredSubscriptions = await getExpiredSubscriptions();

    let processedCount = 0;

    for (const subscription of expiredSubscriptions) {
      // Update subscription status to expired
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: "EXPIRED",
        },
      });

      // Update listener subscription level to FREE
      await prisma.listener.update({
        where: { id: subscription.listenerId },
        data: {
          subscriptionLevel: "FREE",
        },
      });

      processedCount++;
    }

    return processedCount;
  } catch (error) {
    console.error("Error processing expired subscriptions:", error);
    throw error;
  }
};

export {
  initializeDefaultPlans,
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscription,
  getSubscriptionById,
  getActiveSubscription,
  getSubscriptionsByListener,
  cancelSubscription,
  renewSubscription,
  getExpiredSubscriptions,
  processExpiredSubscriptions,
};
