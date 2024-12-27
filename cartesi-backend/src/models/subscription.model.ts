import { PaymentMethod, SubscriptionLevel } from "../configs/enum";
import { Listener } from "./listener.model";

class Subscription {
  static nextId = 1;
  id: number;
  listener: Listener;
  listenerId: number;
  startDate: Date;
  endDate: Date;
  paymentMethod: PaymentMethod;
  subscriptionLevel: SubscriptionLevel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    listener: Listener,
    listenerId: number,
    startDate: Date,
    endDate: Date,
    paymentMethod: PaymentMethod,
    subscriptionLevel: SubscriptionLevel,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = Subscription.nextId++;
    this.subscriptionLevel = subscriptionLevel || SubscriptionLevel.FREE;
    this.listener = listener;
    this.listenerId = listenerId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.paymentMethod = paymentMethod || PaymentMethod.CTSI;
    this.isActive = isActive || true;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}

export { Subscription };
