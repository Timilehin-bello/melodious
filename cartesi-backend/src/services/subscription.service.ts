import { Error_out, Notice } from "cartesi-wallet";
import { Subscription } from "../models";
import { SubscriptionPlan } from "../models/subscriptionPlan.model";
import { SubscriptionLevel } from "../configs/enum";
import { RepositoryService } from "./repository.service";

class SubscriptionService {
  // Initialize default subscription plans
  initializeDefaultPlans(): Notice | Error_out {
    if (RepositoryService.subscriptionPlans.length > 0) {
      return new Notice("Subscription plans already initialized");
    }

    try {
      // Free Plan (default)
      const freePlan = new SubscriptionPlan(
        "Free",
        "Basic music streaming with ads",
        SubscriptionLevel.FREE,
        0,
        30, // 30 days
        {
          adFree: false,
          highQualityAudio: false,
          offlineDownloads: false,
          unlimitedSkips: false,
          exclusiveContent: false,
          prioritySupport: false,
        }
      );

      // Premium Plan
      const premiumPlan = new SubscriptionPlan(
        "Premium",
        "Ad-free music with high quality audio and offline downloads",
        SubscriptionLevel.PREMIUM,
        100, // 100 CTSI tokens
        30, // 30 days
        {
          adFree: true,
          highQualityAudio: true,
          offlineDownloads: true,
          unlimitedSkips: true,
          exclusiveContent: true,
          prioritySupport: true,
        }
      );

      RepositoryService.subscriptionPlans.push(freePlan);
      RepositoryService.subscriptionPlans.push(premiumPlan);

      return new Notice("Default subscription plans initialized successfully");
    } catch (error) {
      return new Error_out(`Failed to initialize subscription plans: ${error}`);
    }
  }

  // Subscription Plan Methods
  createSubscriptionPlan(planData: {
    name: string;
    description: string;
    subscriptionLevel: SubscriptionLevel;
    priceCTSI: number;
    durationDays: number;
    features: any;
  }): SubscriptionPlan | Error_out {
    if (!planData.name || !planData.description || planData.priceCTSI < 0) {
      return new Error_out("Invalid subscription plan data");
    }

    // Check if plan with same name already exists
    const existingPlan = RepositoryService.subscriptionPlans.find(
      (plan) => plan.name.toLowerCase() === planData.name.toLowerCase()
    );
    if (existingPlan) {
      return new Error_out("Subscription plan with this name already exists");
    }

    const plan = new SubscriptionPlan(
      planData.name,
      planData.description,
      planData.subscriptionLevel,
      planData.priceCTSI,
      planData.durationDays,
      planData.features
    );

    RepositoryService.subscriptionPlans.push(plan);
    return plan;
  }

  getSubscriptionPlanById(id: number): SubscriptionPlan | null {
    return (
      RepositoryService.subscriptionPlans.find((plan) => plan.id === id) || null
    );
  }

  getActiveSubscriptionPlans(): SubscriptionPlan[] {
    return RepositoryService.subscriptionPlans.filter((plan) => plan.isActive);
  }

  // Subscription Methods
  createSubscription(subscriptionData: {
    listenerId: number;
    planId: number;
    paymentAmount: number;
    transactionHash?: string;
  }): Subscription | Error_out {
    const listener = RepositoryService.listeners.find(
      (l) => l.id === subscriptionData.listenerId
    );
    if (!listener) {
      return new Error_out("Listener not found");
    }

    const plan = this.getSubscriptionPlanById(subscriptionData.planId);
    if (!plan) {
      return new Error_out("Subscription plan not found");
    }

    // Check if listener already has an active subscription
    const existingSubscription = this.getActiveSubscriptionByListenerId(
      subscriptionData.listenerId
    );
    if (existingSubscription) {
      return new Error_out("Listener already has an active subscription");
    }

    const startDate = new Date();
    const endDate = plan.calculateEndDate(startDate);

    const subscription = new Subscription(
      listener,
      subscriptionData.listenerId,
      subscriptionData.planId,
      startDate,
      endDate,
      listener.subscription?.paymentMethod || ("CTSI" as any),
      plan.subscriptionLevel,
      subscriptionData.paymentAmount,
      true,
      false,
      subscriptionData.transactionHash
    );

    RepositoryService.subscriptions.push(subscription);

    // Update listener's subscription reference
    listener.subscription = subscription;
    listener.subscriptionLevel = subscription.subscriptionLevel;

    return subscription;
  }

  getSubscriptionById(id: number): Subscription | null {
    return RepositoryService.subscriptions.find((sub) => sub.id === id) || null;
  }

  getActiveSubscriptionByListenerId(listenerId: number): Subscription | null {
    return (
      RepositoryService.subscriptions.find(
        (sub) =>
          sub.listenerId === listenerId && sub.isActive && !sub.isExpired()
      ) || null
    );
  }

  getActiveSubscriptions(): Subscription[] {
    return RepositoryService.subscriptions.filter(
      (sub) => sub.isActive && !sub.isExpired()
    );
  }

  getExpiredSubscriptions(): Subscription[] {
    return RepositoryService.subscriptions.filter((sub) => sub.isExpired());
  }

  updateSubscription(
    id: number,
    updates: Partial<Subscription>
  ): Subscription | Error_out {
    const subscription = this.getSubscriptionById(id);
    if (!subscription) {
      return new Error_out("Subscription not found");
    }

    Object.assign(subscription, updates, { updatedAt: new Date() });

    // Update listener's subscription level if changed
    if (updates.subscriptionLevel) {
      const listener = RepositoryService.listeners.find(
        (l) => l.id === subscription.listenerId
      );
      if (listener) {
        listener.subscriptionLevel = updates.subscriptionLevel;
      }
    }

    return subscription;
  }

  cancelSubscription(id: number): Subscription | Error_out {
    const subscription = this.getSubscriptionById(id);
    if (!subscription) {
      return new Error_out("Subscription not found");
    }

    subscription.cancel();

    // Update listener's subscription level to FREE
    const listener = RepositoryService.listeners.find(
      (l) => l.id === subscription.listenerId
    );
    if (listener) {
      listener.subscriptionLevel = SubscriptionLevel.FREE;
      listener.subscription = null;
    }

    return subscription;
  }

  renewSubscription(
    id: number,
    transactionHash?: string
  ): Subscription | Error_out {
    const subscription = this.getSubscriptionById(id);
    if (!subscription) {
      return new Error_out("Subscription not found");
    }

    const plan = this.getSubscriptionPlanById(subscription.planId);
    if (!plan) {
      return new Error_out("Subscription plan not found");
    }

    const newEndDate = plan.calculateEndDate(subscription.endDate);
    subscription.renew(newEndDate, transactionHash);

    return subscription;
  }
}

export { SubscriptionService };
