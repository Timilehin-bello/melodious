import cron from "node-cron";
import { subscriptionService } from "./";
import { prisma } from "./";
import logger from "../configs/logger";

// Interface for renewal result
interface RenewalResult {
  success: boolean;
  subscriptionId: string;
  userId: number;
  planId: number;
  error?: string;
  paymentRequired?: boolean;
}

// Interface for expiration check result
interface ExpirationCheckResult {
  expiredSubscriptions: number;
  renewedSubscriptions: number;
  failedRenewals: number;
  errors: string[];
}

/**
 * Check for expired subscriptions and handle renewals
 * @returns Summary of expiration check results
 */
const checkExpiredSubscriptions = async (): Promise<ExpirationCheckResult> => {
  const result: ExpirationCheckResult = {
    expiredSubscriptions: 0,
    renewedSubscriptions: 0,
    failedRenewals: 0,
    errors: [],
  };

  try {
    logger.info("Starting expired subscription check...");

    // Find all active subscriptions that have expired
    const expiredSubscriptions = await prisma.userSubscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: new Date(),
        },
      },
      include: {
        plan: true,
        listener: true,
      },
    });

    logger.info(`Found ${expiredSubscriptions.length} expired subscriptions`);
    result.expiredSubscriptions = expiredSubscriptions.length;

    // Process each expired subscription
    for (const subscription of expiredSubscriptions) {
      try {
        if (subscription.autoRenew) {
          // Attempt to renew the subscription
          const renewalResult = await attemptRenewal(subscription.id);

          if (renewalResult.success) {
            result.renewedSubscriptions++;
            logger.info(
              `Successfully renewed subscription ${subscription.id} for user ${subscription.listenerId}`
            );
          } else {
            result.failedRenewals++;
            result.errors.push(
              `Failed to renew subscription ${subscription.id}: ${renewalResult.error}`
            );

            // Mark subscription as expired since renewal failed
            await markSubscriptionExpired(
              subscription.id,
              renewalResult.error || "Renewal failed"
            );
          }
        } else {
          // Mark subscription as expired (no auto-renewal)
          await markSubscriptionExpired(
            subscription.id,
            "Subscription expired - auto-renewal disabled"
          );
          logger.info(
            `Marked subscription ${subscription.id} as expired (auto-renewal disabled)`
          );
        }
      } catch (error) {
        result.failedRenewals++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        result.errors.push(
          `Error processing subscription ${subscription.id}: ${errorMessage}`
        );
        logger.error(
          `Error processing expired subscription ${subscription.id}:`,
          error
        );
      }
    }

    logger.info(
      `Expired subscription check completed. Renewed: ${result.renewedSubscriptions}, Failed: ${result.failedRenewals}`
    );
    return result;
  } catch (error) {
    logger.error("Error during expired subscription check:", error);
    result.errors.push(
      `Global error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return result;
  }
};

/**
 * Attempt to renew a subscription
 * @param subscriptionId - ID of the subscription to renew
 * @returns Renewal result
 */
const attemptRenewal = async (
  subscriptionId: string
): Promise<RenewalResult> => {
  try {
    // Get the subscription details
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        listener: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        subscriptionId,
        userId: 0,
        planId: 0,
        error: "Subscription not found",
      };
    }

    // Check if user has sufficient balance or payment method
    // This would typically integrate with your payment system
    const hasPaymentMethod = await checkPaymentMethod(subscription.listenerId);

    if (!hasPaymentMethod) {
      return {
        success: false,
        subscriptionId,
        userId: subscription.listenerId,
        planId: subscription.planId,
        error: "No valid payment method available",
        paymentRequired: true,
      };
    }

    // Calculate new end date based on plan duration
    const currentEndDate = subscription.endDate;
    const newEndDate = calculateNewEndDate(
      currentEndDate,
      subscription.plan.duration
    );

    // Update the subscription with new end date
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        endDate: newEndDate,
        updatedAt: new Date(),
      },
    });

    // Create a payment record for the renewal
    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscriptionId,
        amount: subscription.plan.price,
        currency: "ETH",
        status: "COMPLETED", // In real implementation, this would be 'PENDING' until payment is confirmed
        transactionHash: `renewal_${subscriptionId}_${Date.now()}`,
        paymentDate: new Date(),
      },
    });

    // Log the renewal (in a real implementation, you might want to create a separate audit log)
    logger.info(`Subscription ${subscriptionId} renewed successfully`, {
      previousEndDate: currentEndDate.toISOString(),
      newEndDate: newEndDate.toISOString(),
      renewalType: "AUTO_RENEWAL",
    });

    return {
      success: true,
      subscriptionId,
      userId: subscription.listenerId,
      planId: subscription.planId,
    };
  } catch (error) {
    logger.error(
      `Error attempting renewal for subscription ${subscriptionId}:`,
      error
    );
    return {
      success: false,
      subscriptionId,
      userId: 0,
      planId: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Mark a subscription as expired
 * @param subscriptionId - ID of the subscription
 * @param reason - Reason for expiration
 */
const markSubscriptionExpired = async (
  subscriptionId: string,
  reason: string
): Promise<void> => {
  try {
    // Update subscription status to EXPIRED
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "EXPIRED",
        updatedAt: new Date(),
      },
    });

    // Log the expiration (in a real implementation, you might want to create a separate audit log)
    logger.info(`Subscription ${subscriptionId} expired`, {
      reason,
      expiredAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      `Error marking subscription ${subscriptionId} as expired:`,
      error
    );
    throw error;
  }
};

/**
 * Check if user has a valid payment method
 * @param userId - User ID
 * @returns Whether user has valid payment method
 */
const checkPaymentMethod = async (userId: number): Promise<boolean> => {
  try {
    // This is a placeholder implementation
    // In a real application, you would check with your payment provider
    // (Stripe, PayPal, etc.) to see if the user has valid payment methods

    // For now, we'll check if the user has made any successful payments before
    const successfulPayments = await prisma.subscriptionPayment.findFirst({
      where: {
        subscription: {
          listenerId: userId,
        },
        status: "COMPLETED",
      },
    });

    return !!successfulPayments;
  } catch (error) {
    logger.error(`Error checking payment method for user ${userId}:`, error);
    return false;
  }
};

/**
 * Calculate new end date based on plan duration
 * @param currentEndDate - Current subscription end date
 * @param duration - Plan duration in days
 * @returns New end date
 */
const calculateNewEndDate = (currentEndDate: Date, duration: number): Date => {
  const newEndDate = new Date(currentEndDate);
  newEndDate.setDate(newEndDate.getDate() + duration);
  return newEndDate;
};

/**
 * Get subscriptions expiring soon (within specified days)
 * @param daysAhead - Number of days to look ahead
 * @returns List of subscriptions expiring soon
 */
const getSubscriptionsExpiringSoon = async (daysAhead: number = 7) => {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const expiringSoon = await prisma.userSubscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        plan: true,
        listener: true,
      },
      orderBy: {
        endDate: "asc",
      },
    });

    return expiringSoon;
  } catch (error) {
    logger.error("Error getting subscriptions expiring soon:", error);
    throw error;
  }
};

/**
 * Send renewal reminders to users with expiring subscriptions
 * @param daysAhead - Number of days before expiration to send reminder
 */
const sendRenewalReminders = async (daysAhead: number = 3): Promise<void> => {
  try {
    const expiringSoon = await getSubscriptionsExpiringSoon(daysAhead);

    logger.info(
      `Found ${expiringSoon.length} subscriptions expiring in ${daysAhead} days`
    );

    for (const subscription of expiringSoon) {
      try {
        // This would integrate with your email service
        // For now, we'll just log the reminder
        logger.info(
          `Renewal reminder needed for listener ID: ${subscription.listenerId} - subscription expires on ${subscription.endDate}`
        );

        // In a real implementation, you would send an email here
        // await emailService.sendRenewalReminder(subscription.listener.email, {
        //   planName: subscription.plan.name,
        //   expirationDate: subscription.endDate,
        //   autoRenew: subscription.autoRenew
        // });
      } catch (error) {
        logger.error(
          `Error sending renewal reminder for subscription ${subscription.id}:`,
          error
        );
      }
    }
  } catch (error) {
    logger.error("Error sending renewal reminders:", error);
  }
};

/**
 * Initialize the renewal service with cron jobs
 */
const initializeRenewalService = (): void => {
  logger.info("Initializing subscription renewal service...");

  // Check for expired subscriptions every hour
  cron.schedule("0 * * * *", async () => {
    logger.info("Running scheduled expired subscription check...");
    await checkExpiredSubscriptions();
  });

  // Send renewal reminders daily at 9 AM
  cron.schedule("0 9 * * *", async () => {
    logger.info("Running scheduled renewal reminders...");
    await sendRenewalReminders(3); // 3 days before expiration
    await sendRenewalReminders(1); // 1 day before expiration
  });

  logger.info("Subscription renewal service initialized with cron jobs");
};

/**
 * Manually trigger renewal for a specific subscription
 * @param subscriptionId - ID of the subscription to renew
 * @returns Renewal result
 */
const manualRenewal = async (
  subscriptionId: string
): Promise<RenewalResult> => {
  logger.info(`Manual renewal triggered for subscription ${subscriptionId}`);
  return await attemptRenewal(subscriptionId);
};

/**
 * Get renewal statistics
 * @param days - Number of days to look back
 * @returns Renewal statistics
 */
const getRenewalStats = async (days: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Since we don't have a subscription history table, we'll use payment records as a proxy
    const renewalPayments = await prisma.subscriptionPayment.findMany({
      where: {
        status: "COMPLETED",
        paymentDate: {
          gte: startDate,
        },
        transactionHash: {
          startsWith: "renewal_",
        },
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    const expiredSubscriptions = await prisma.userSubscription.findMany({
      where: {
        status: "EXPIRED",
        updatedAt: {
          gte: startDate,
        },
      },
    });

    return {
      totalRenewals: renewalPayments.length,
      totalExpirations: expiredSubscriptions.length,
      renewalRate:
        (renewalPayments.length /
          (renewalPayments.length + expiredSubscriptions.length)) *
        100,
      renewalsByPlan: renewalPayments.reduce(
        (acc: Record<string, number>, payment: any) => {
          const planName = payment.subscription.plan.name;
          acc[planName] = (acc[planName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  } catch (error) {
    logger.error("Error getting renewal stats:", error);
    throw error;
  }
};

export {
  checkExpiredSubscriptions,
  attemptRenewal,
  markSubscriptionExpired,
  getSubscriptionsExpiringSoon,
  sendRenewalReminders,
  initializeRenewalService,
  manualRenewal,
  getRenewalStats,
};

export default {
  checkExpiredSubscriptions,
  attemptRenewal,
  markSubscriptionExpired,
  getSubscriptionsExpiringSoon,
  sendRenewalReminders,
  initializeRenewalService,
  manualRenewal,
  getRenewalStats,
};
