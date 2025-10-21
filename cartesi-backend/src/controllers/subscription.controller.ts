import { Error_out, Log } from "cartesi-wallet";
import { SubscriptionService } from "../services";
import type { ISubscribe } from "../services/subscription.service";

class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Handle subscription payment and create subscription record
   */
  public subscribe(subscriptionData: ISubscribe) {
    const { walletAddress, ...rest } = subscriptionData;
    if (!walletAddress) {
      return new Error_out("Wallet address is required");
    }

    if (!subscriptionData.subscriptionLevel) {
      return new Error_out("Subscription level is required");
    }

    if (!subscriptionData.amount || subscriptionData.amount <= 0) {
      return new Error_out("Valid subscription amount is required");
    }

    console.log("Processing subscription request", {
      walletAddress: subscriptionData.walletAddress,
      subscriptionLevel: subscriptionData.subscriptionLevel,
      amount: subscriptionData.amount,
    });

    try {
      const result = this.subscriptionService.subscribe({
        ...rest,
        walletAddress: walletAddress.toLowerCase(),
      });

      if (result instanceof Error_out) {
        return result;
      }

      // The service now returns a Notice object, so we return it directly
      console.log("Subscription created successfully, returning notice");
      return result;
    } catch (error) {
      const error_msg = `Failed to process subscription: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Get subscription information by wallet address
   */
  public getSubscription(walletAddress: string) {
    if (!walletAddress) {
      return new Error_out("Wallet address is required");
    }

    try {
      const subscription =
        this.subscriptionService.getSubscription(walletAddress);

      if (!subscription) {
        return new Log(
          JSON.stringify({ message: "No active subscription found" })
        );
      }

      const subscriptionJson = JSON.stringify({
        id: subscription.id,
        subscriptionLevel: subscription.subscriptionLevel,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isActive: subscription.isActive,
        paymentMethod: subscription.paymentMethod,
      });

      console.log("Subscription found", subscriptionJson);
      return new Log(subscriptionJson);
    } catch (error) {
      const error_msg = `Failed to get subscription: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Get all subscriptions
   */
  public getAllSubscriptions() {
    try {
      const subscriptions = this.subscriptionService.getAllSubscriptions();
      const subscriptionsJson = JSON.stringify(
        subscriptions.map((sub) => ({
          id: sub.id,
          listenerId: sub.listenerId,
          subscriptionLevel: sub.subscriptionLevel,
          startDate: sub.startDate,
          endDate: sub.endDate,
          isActive: sub.isActive,
          paymentMethod: sub.paymentMethod,
        }))
      );

      console.log("All subscriptions", subscriptionsJson);
      return new Log(subscriptionsJson);
    } catch (error) {
      const error_msg = `Failed to get all subscriptions: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Update subscription status
   */
  public updateSubscriptionStatus(subscriptionId: number, isActive: boolean) {
    if (!subscriptionId) {
      return new Error_out("Subscription ID is required");
    }

    try {
      const result = this.subscriptionService.updateSubscriptionStatus(
        subscriptionId,
        isActive
      );

      if (!result) {
        return new Error_out("Subscription not found");
      }

      // The service now returns a Notice object, so we return it directly
      console.log("Subscription status updated successfully, returning notice");
      return result;
    } catch (error) {
      const error_msg = `Failed to update subscription status: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }
}

export { SubscriptionController };
