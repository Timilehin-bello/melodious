import { Error_out, Log, Notice } from "cartesi-wallet";
import { Subscription, SubscriptionPlan } from "../models";
import { SubscriptionService } from "../services";
import { SubscriptionLevel } from "../configs/enum";

class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  // Initialize default subscription plans
  initializeDefaultPlans() {
    const result = this.subscriptionService.initializeDefaultPlans();

    if (result instanceof Error_out) {
      return result;
    }

    try {
      const notice_payload = `{"type":"initialize_default_plans", "content":"Default subscription plans initialized successfully"}`;
      return new Notice(notice_payload);
    } catch (error) {
      console.log("Failed to initialize default plans", error);
      return new Error_out(`Failed to initialize default plans`);
    }
  }

  // Create a new subscription plan
  createSubscriptionPlan(planData: {
    name: string;
    description: string;
    subscriptionLevel: SubscriptionLevel;
    priceCTSI: number;
    durationDays: number;
    features: any;
  }) {
    const plan = this.subscriptionService.createSubscriptionPlan(planData);

    if (plan instanceof Error_out) {
      return plan;
    }

    try {
      const plan_json = JSON.stringify(plan);
      console.log("Created subscription plan", plan_json);

      const notice_payload = `{"type":"create_subscription_plan", "content":${plan_json}}`;
      return new Notice(notice_payload);
    } catch (error) {
      console.log("Failed to create subscription plan", error);
      return new Error_out(`Failed to create subscription plan`);
    }
  }

  // Get subscription plan by ID
  getSubscriptionPlan(planId: number) {
    try {
      const plan = this.subscriptionService.getSubscriptionPlanById(planId);

      if (!plan) {
        return new Error_out("Subscription plan not found");
      }

      const plan_json = JSON.stringify(plan);
      console.log("Retrieved subscription plan", plan_json);
      return new Log(plan_json);
    } catch (error) {
      console.log("Failed to get subscription plan", error);
      return new Error_out(`Failed to get subscription plan`);
    }
  }

  // Get all active subscription plans
  getActiveSubscriptionPlans() {
    try {
      const plans = this.subscriptionService.getActiveSubscriptionPlans();
      const plans_json = JSON.stringify(plans);
      console.log("Retrieved active subscription plans", plans_json);
      return new Log(plans_json);
    } catch (error) {
      console.log("Failed to get active subscription plans", error);
      return new Error_out(`Failed to get active subscription plans`);
    }
  }

  // Create a new subscription for a listener
  createSubscription(subscriptionData: {
    listenerId: number;
    planId: number;
    paymentAmount: number;
    transactionHash?: string;
  }) {
    const subscription =
      this.subscriptionService.createSubscription(subscriptionData);

    if (subscription instanceof Error_out) {
      return subscription;
    }

    try {
      const subscription_json = JSON.stringify(subscription);
      console.log("Created subscription", subscription_json);

      const notice_payload = `{"type":"create_subscription", "content":${subscription_json}}`;
      return new Notice(notice_payload);
    } catch (error) {
      console.log("Failed to create subscription", error);
      return new Error_out(`Failed to create subscription`);
    }
  }

  // Get subscription by ID
  getSubscription(subscriptionId: number) {
    try {
      const subscription =
        this.subscriptionService.getSubscriptionById(subscriptionId);

      if (!subscription) {
        return new Error_out("Subscription not found");
      }

      const subscription_json = JSON.stringify(subscription);
      console.log("Retrieved subscription", subscription_json);
      return new Log(subscription_json);
    } catch (error) {
      console.log("Failed to get subscription", error);
      return new Error_out(`Failed to get subscription`);
    }
  }

  // Get active subscription for a listener
  getListenerSubscription(listenerId: number) {
    try {
      const subscription =
        this.subscriptionService.getActiveSubscriptionByListenerId(listenerId);

      if (!subscription) {
        return new Log(
          JSON.stringify({
            message: "No active subscription found for listener",
          })
        );
      }

      const subscription_json = JSON.stringify(subscription);
      console.log("Retrieved listener subscription", subscription_json);
      return new Log(subscription_json);
    } catch (error) {
      console.log("Failed to get listener subscription", error);
      return new Error_out(`Failed to get listener subscription`);
    }
  }

  // Get all active subscriptions
  getActiveSubscriptions() {
    try {
      const subscriptions = this.subscriptionService.getActiveSubscriptions();
      const subscriptions_json = JSON.stringify(subscriptions);
      console.log("Retrieved active subscriptions", subscriptions_json);
      return new Log(subscriptions_json);
    } catch (error) {
      console.log("Failed to get active subscriptions", error);
      return new Error_out(`Failed to get active subscriptions`);
    }
  }

  // Get expired subscriptions
  getExpiredSubscriptions() {
    try {
      const subscriptions = this.subscriptionService.getExpiredSubscriptions();
      const subscriptions_json = JSON.stringify(subscriptions);
      console.log("Retrieved expired subscriptions", subscriptions_json);
      return new Log(subscriptions_json);
    } catch (error) {
      console.log("Failed to get expired subscriptions", error);
      return new Error_out(`Failed to get expired subscriptions`);
    }
  }

  // Update subscription
  updateSubscription(subscriptionId: number, updates: Partial<Subscription>) {
    const updatedSubscription = this.subscriptionService.updateSubscription(
      subscriptionId,
      updates
    );

    if (updatedSubscription instanceof Error_out) {
      return updatedSubscription;
    }

    try {
      const subscription_json = JSON.stringify(updatedSubscription);
      console.log("Updated subscription", subscription_json);

      const notice_payload = `{"type":"update_subscription", "content":${subscription_json}}`;
      return new Notice(notice_payload);
    } catch (error) {
      console.log("Failed to update subscription", error);
      return new Error_out(`Failed to update subscription`);
    }
  }

  // Cancel subscription
  cancelSubscription(subscriptionId: number) {
    const cancelledSubscription =
      this.subscriptionService.cancelSubscription(subscriptionId);

    if (cancelledSubscription instanceof Error_out) {
      return cancelledSubscription;
    }

    try {
      const subscription_json = JSON.stringify(cancelledSubscription);
      console.log("Cancelled subscription", subscription_json);

      const notice_payload = `{"type":"cancel_subscription", "content":${subscription_json}}`;
      return new Notice(notice_payload);
    } catch (error) {
      console.log("Failed to cancel subscription", error);
      return new Error_out(`Failed to cancel subscription`);
    }
  }

  // Renew subscription
  renewSubscription(subscriptionId: number, transactionHash?: string) {
    const renewedSubscription = this.subscriptionService.renewSubscription(
      subscriptionId,
      transactionHash
    );

    if (renewedSubscription instanceof Error_out) {
      return renewedSubscription;
    }

    try {
      const subscription_json = JSON.stringify(renewedSubscription);
      console.log("Renewed subscription", subscription_json);

      const notice_payload = `{"type":"renew_subscription", "content":${subscription_json}}`;
      return new Notice(notice_payload);
    } catch (error) {
      console.log("Failed to renew subscription", error);
      return new Error_out(`Failed to renew subscription`);
    }
  }
}

export { SubscriptionController };
