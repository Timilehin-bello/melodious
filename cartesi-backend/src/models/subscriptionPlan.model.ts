import { SubscriptionLevel } from "../configs/enum";

interface PlanFeatures {
  adFree: boolean;
  highQualityAudio: boolean;
  offlineDownloads: boolean;
  unlimitedSkips: boolean;
  exclusiveContent: boolean;
  prioritySupport: boolean;
}

class SubscriptionPlan {
  static nextId = 1;
  id: number;
  name: string;
  description: string;
  subscriptionLevel: SubscriptionLevel;
  priceCTSI: number;
  durationDays: number;
  features: PlanFeatures;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    name: string,
    description: string,
    subscriptionLevel: SubscriptionLevel,
    priceCTSI: number,
    durationDays: number,
    features: PlanFeatures,
    isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = SubscriptionPlan.nextId++;
    this.name = name;
    this.description = description;
    this.subscriptionLevel = subscriptionLevel;
    this.priceCTSI = priceCTSI;
    this.durationDays = durationDays;
    this.features = features;
    this.isActive = isActive;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // Calculate end date from start date
  calculateEndDate(startDate: Date): Date {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + this.durationDays);
    return endDate;
  }
}

export { SubscriptionPlan };
export type { PlanFeatures };
