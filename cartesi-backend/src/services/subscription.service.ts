import { RepositoryService } from "./repository.service";
import { Error_out } from "cartesi-wallet";
import { Subscription } from "../models/subscription.model";
import { Listener } from "../models/listener.model";
import { User } from "../models/user.model";
import { PaymentMethod, SubscriptionLevel } from "../configs/enum";

interface ISubscribe {
  walletAddress: string;
  subscriptionLevel: string;
  amount: number;
}

class SubscriptionService {
  /**
   * Process a subscription payment and create subscription record
   */
  subscribe(subscriptionData: ISubscribe) {
    if (
      !subscriptionData.walletAddress ||
      !subscriptionData.subscriptionLevel
    ) {
      return new Error_out("Missing required fields for subscription");
    }

    if (!subscriptionData.amount || subscriptionData.amount <= 0) {
      return new Error_out("Invalid subscription amount");
    }

    console.log("Processing subscription", {
      walletAddress: subscriptionData.walletAddress,
      subscriptionLevel: subscriptionData.subscriptionLevel,
      amount: subscriptionData.amount,
    });

    try {
      // Find or create user first
      let user = RepositoryService.users.find(
        (u) =>
          u.walletAddress.toLowerCase() ===
          subscriptionData.walletAddress.toLowerCase()
      );

      if (!user) {
        // Create a basic user if not found
        user = new User(
          subscriptionData.walletAddress, // name
          subscriptionData.walletAddress, // displayName
          subscriptionData.walletAddress, // walletAddress
          subscriptionData.walletAddress, // username
          "LISTENER", // role
          new Date(), // createdAt
          new Date(), // updatedAt
          null, // artist
          null // listener
        );
      }

      // Find or create listener
      let listener = RepositoryService.listeners.find(
        (l) => l.userId === user!.id
      );

      if (!listener) {
        // Create a basic listener if not found
        listener = new Listener(user!.id, new Date(), new Date());
        RepositoryService.listeners.push(listener);
      }
      user.listener = listener;
      RepositoryService.users.push(user);

      // Create subscription record
      const subscription = new Subscription(
        listener,
        listener.id,
        new Date(),
        this.calculateEndDate(subscriptionData.subscriptionLevel),
        PaymentMethod.CTSI,
        subscriptionData.subscriptionLevel.toUpperCase() as SubscriptionLevel,
        true,
        new Date(),
        new Date()
      );

      // Save to repository
      RepositoryService.subscriptions.push(subscription);

      // Create repository notice for subscription creation
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "subscription_created",
        subscription
      );

      // Also create specific subscription notice
      const subscriptionNotice = RepositoryService.createDataNotice(
        "subscriptions",
        "created",
        subscription
      );

      console.log("Subscription created successfully", {
        id: subscription.id,
        listener: user!.walletAddress,
        subscriptionLevel: subscription.subscriptionLevel,
        endDate: subscription.endDate,
      });

      return repositoryNotice;
    } catch (error) {
      console.error("Error processing subscription:", error);
      return new Error_out(`Failed to process subscription: ${error}`);
    }
  }

  /**
   * Calculate subscription end date based on subscription level
   */
  private calculateEndDate(subscriptionLevel: string): Date {
    const startDate = new Date();
    const endDate = new Date(startDate);

    // Premium subscription lasts for 30 days
    if (subscriptionLevel.toUpperCase() === "PREMIUM") {
      endDate.setDate(startDate.getDate() + 30);
    } else {
      // Free subscription doesn't have an end date, but we'll set it to 1 year from now
      endDate.setFullYear(startDate.getFullYear() + 1);
    }

    return endDate;
  }

  /**
   * Get subscription by wallet address
   */
  getSubscription(walletAddress: string) {
    // Find user first
    const user = RepositoryService.users.find(
      (u) => u.walletAddress === walletAddress
    );

    if (!user) {
      return null;
    }

    // Find listener
    const listener = RepositoryService.listeners.find(
      (l) => l.userId === user.id
    );

    if (!listener) {
      return null;
    }

    // Find active subscription
    return RepositoryService.subscriptions.find(
      (s) => s.listenerId === listener.id && s.isActive
    );
  }

  /**
   * Get all subscriptions
   */
  getAllSubscriptions() {
    return RepositoryService.subscriptions;
  }

  /**
   * Update subscription status
   */
  updateSubscriptionStatus(subscriptionId: number, isActive: boolean) {
    const subscription = RepositoryService.subscriptions.find(
      (s) => s.id === subscriptionId
    );

    if (subscription) {
      subscription.isActive = isActive;
      subscription.updatedAt = new Date();

      // Create repository notice for subscription status update
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "subscription_status_updated",
        subscription
      );

      // Also create specific subscription notice
      const subscriptionNotice = RepositoryService.createDataNotice(
        "subscriptions",
        "status_updated",
        subscription
      );

      return repositoryNotice;
    }

    return null;
  }
}

export { SubscriptionService };
export type { ISubscribe };
