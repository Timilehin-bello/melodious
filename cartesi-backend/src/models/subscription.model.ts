import { PaymentMethod, SubscriptionLevel } from "../configs/enum";
import { Listener } from "./listener.model";

class Subscription {
  static nextId = 1;
  id: number;
  listener: Listener;
  listenerId: number;
  planId: number; // Reference to subscription plan
  startDate: Date;
  endDate: Date;
  paymentMethod: PaymentMethod;
  subscriptionLevel: SubscriptionLevel;
  isActive: boolean;
  autoRenew: boolean; // New field for auto-renewal
  paymentAmount: number; // CTSI amount paid
  transactionHash?: string; // Blockchain transaction reference
  createdAt: Date;
  updatedAt: Date;

  constructor(
    listener: Listener,
    listenerId: number,
    planId: number,
    startDate: Date,
    endDate: Date,
    paymentMethod: PaymentMethod,
    subscriptionLevel: SubscriptionLevel,
    paymentAmount: number,
    isActive: boolean = true,
    autoRenew: boolean = false,
    transactionHash?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = Subscription.nextId++;
    this.listener = listener;
    this.listenerId = listenerId;
    this.planId = planId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.paymentMethod = paymentMethod || PaymentMethod.CTSI;
    this.subscriptionLevel = subscriptionLevel || SubscriptionLevel.FREE;
    this.paymentAmount = paymentAmount;
    this.isActive = isActive;
    this.autoRenew = autoRenew;
    this.transactionHash = transactionHash;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // Check if subscription is expired
  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  // Calculate remaining days
  getRemainingDays(): number {
    const now = new Date();
    const diffTime = this.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Renew subscription
  renew(newEndDate: Date, transactionHash?: string): void {
    this.endDate = newEndDate;
    this.isActive = true;
    this.transactionHash = transactionHash;
    this.updatedAt = new Date();
  }

  // Cancel subscription
  cancel(): void {
    this.isActive = false;
    this.autoRenew = false;
    this.updatedAt = new Date();
  }
}

export { Subscription };
