# Subscription Management System - Technical Proposal

## Executive Summary

This document presents a comprehensive technical proposal for implementing a subscription management system within the Melodious platform, integrating seamlessly with the existing Cartesi backend and server infrastructure. The system will provide tiered subscription plans, automated payment processing, access control, and dynamic ad display management.

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Server      │    │ Cartesi Backend │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (TypeScript)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web3 Wallet   │    │   PostgreSQL    │    │  Smart Contract │
│   Integration   │    │   Database      │    │     Vault       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 Component Integration

- **Frontend**: Subscription UI, payment forms, access control
- **Server**: Subscription management API, payment validation, database operations
- **Cartesi Backend**: Payment processing, voucher generation, subscription state management
- **Smart Contracts**: Vault deposits, payment verification, fund management

## 2. Subscription Plan Management

### 2.1 Cartesi Backend Model Repository Integration

#### Enhanced Subscription Model (Update Existing)

```typescript
// cartesi-backend/src/models/subscription.model.ts
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
```

#### New Subscription Plan Model

```typescript
// cartesi-backend/src/models/subscriptionPlan.model.ts
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

export { SubscriptionPlan, PlanFeatures };
```

#### Enhanced Repository Service (Update Existing)

```typescript
// cartesi-backend/src/services/repository.service.ts
import * as Model from "../models";
import { SubscriptionPlan } from "../models/subscriptionPlan.model";

class RepositoryService {
  static users: Model.User[] = [];
  static albums: Model.Album[] = [];
  static genres: Model.Genre[] = [];
  static tracks: Model.Track[] = [];
  static artists: Model.Artist[] = [];
  static listeners: Model.Listener[] = [];
  static subscriptions: Model.Subscription[] = []; // Add subscription storage
  static subscriptionPlans: SubscriptionPlan[] = []; // Add subscription plans storage
  static config: Model.Config | null = null;
}

export { RepositoryService };
```

#### New Subscription Service (Following Existing Pattern)

```typescript
// cartesi-backend/src/services/subscription.service.ts
import { Error_out, Notice } from "cartesi-wallet";
import { Subscription, SubscriptionLevel } from "../models";
import { SubscriptionPlan } from "../models/subscriptionPlan.model";
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
```

#### Update Models Index

```typescript
// cartesi-backend/src/models/index.ts
export * from "./album.model";
export * from "./artist.model";
export * from "./config.model";
export * from "./genre.model";
export * from "./listener.model";
export * from "./playlist.model";
export * from "./storage.model";
export * from "./subscription.model";
export * from "./subscriptionPlan.model"; // Add new model
export * from "./track.model";
export * from "./user.model";
export * from "./userFavourite.model";
```

#### Update Services Index

```typescript
// cartesi-backend/src/services/index.ts
export { RepositoryService } from "./repository.service";
export { ConfigService } from "./config.service";
export { SubscriptionService } from "./subscription.service"; // Add new service
export * from "./reward.service";
```

### 2.2 Server Database Schema Extensions

#### New Tables

```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  tier_level INTEGER NOT NULL, -- 1=Basic, 2=Premium, 3=Pro
  features JSONB NOT NULL, -- {"ad_free": true, "high_quality": true}
  max_downloads INTEGER DEFAULT 0,
  max_playlists INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled, pending
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(50) DEFAULT 'crypto',
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Payments
CREATE TABLE subscription_payments (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CTSI',
  transaction_hash VARCHAR(66),
  vault_deposit_confirmed BOOLEAN DEFAULT false,
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
  payment_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription History
CREATE TABLE subscription_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  subscription_id INTEGER REFERENCES user_subscriptions(id),
  action VARCHAR(50) NOT NULL, -- created, renewed, cancelled, expired
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Schema Updates

```sql
-- Update Listener table to include subscription info
ALTER TABLE listeners ADD COLUMN current_subscription_id INTEGER REFERENCES user_subscriptions(id);
ALTER TABLE listeners ADD COLUMN subscription_tier INTEGER DEFAULT 0; -- 0=Free, 1=Basic, 2=Premium, 3=Pro
ALTER TABLE listeners ADD COLUMN ad_free_until TIMESTAMP;
```

### 2.2 Subscription Plan Controller (Cartesi Backend)

```typescript
// cartesi-backend/src/controllers/subscription.controller.ts
import { Error_out, Notice } from "cartesi-wallet";
import { ISubscriptionPlan, IUserSubscription } from "../interfaces";

class SubscriptionController {
  private plans: Map<number, ISubscriptionPlan> = new Map();
  private userSubscriptions: Map<string, IUserSubscription[]> = new Map();

  public createPlan(planData: ISubscriptionPlan) {
    if (!planData.name || !planData.price_monthly || !planData.tier_level) {
      return new Error_out("Missing required plan fields");
    }

    const planId = Date.now();
    const plan = {
      ...planData,
      id: planId,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    this.plans.set(planId, plan);
    return new Notice(`Subscription plan created: ${planId}`);
  }

  public subscribeToPlan(subscriptionData: {
    walletAddress: string;
    planId: number;
    duration: "monthly" | "yearly";
  }) {
    const plan = this.plans.get(subscriptionData.planId);
    if (!plan) {
      return new Error_out("Subscription plan not found");
    }

    const subscription: IUserSubscription = {
      id: Date.now(),
      user_wallet: subscriptionData.walletAddress,
      plan_id: subscriptionData.planId,
      status: "pending",
      start_date: new Date().toISOString(),
      end_date: this.calculateEndDate(subscriptionData.duration),
      auto_renew: true,
      payment_method: "crypto",
    };

    const userSubs =
      this.userSubscriptions.get(subscriptionData.walletAddress) || [];
    userSubs.push(subscription);
    this.userSubscriptions.set(subscriptionData.walletAddress, userSubs);

    return new Notice(`Subscription created: ${subscription.id}`);
  }

  public getActiveSubscription(walletAddress: string) {
    const userSubs = this.userSubscriptions.get(walletAddress) || [];
    return userSubs.find(
      (sub) => sub.status === "active" && new Date(sub.end_date) > new Date()
    );
  }

  private calculateEndDate(duration: "monthly" | "yearly"): string {
    const now = new Date();
    if (duration === "yearly") {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
  }
}

export { SubscriptionController };
```

## 3. Payment Processing Integration

### 3.1 Enhanced Vault Integration

#### Subscription Payment Route (Cartesi Backend)

```typescript
// cartesi-backend/src/routes/subscription-payment.route.ts
import { AdvanceRoute } from "cartesi-router";
import { Error_out, Voucher } from "cartesi-wallet";
import { SubscriptionController, VaultController } from "../controllers";
import { encodeFunctionData, parseEther } from "viem";
import { ctsiTokenConfigABI } from "../configs";

class SubscriptionPaymentRoute extends AdvanceRoute {
  subscription: SubscriptionController;
  vault: VaultController;

  constructor(subscription: SubscriptionController, vault: VaultController) {
    super();
    this.subscription = subscription;
    this.vault = vault;
  }

  public execute = (request: any) => {
    this.parse_request(request);

    const { signer, planId, duration, amount } = this.request_args;

    try {
      // Create subscription
      const subscriptionResult = this.subscription.subscribeToPlan({
        walletAddress: signer,
        planId,
        duration,
      });

      if (subscriptionResult instanceof Error_out) {
        return subscriptionResult;
      }

      // Process payment to vault
      const vaultResult = this.vault.depositToVault({
        walletAddress: signer,
        amount,
        purpose: "subscription_payment",
        metadata: { planId, duration },
      });

      if (vaultResult instanceof Error_out) {
        return vaultResult;
      }

      // Emit voucher for subscription activation
      const activationVoucher = this.createSubscriptionActivationVoucher(
        signer,
        planId
      );

      return [vaultResult, activationVoucher];
    } catch (error) {
      return new Error_out(`Subscription payment failed: ${error}`);
    }
  };

  private createSubscriptionActivationVoucher(
    walletAddress: string,
    planId: number
  ) {
    // This voucher will be executed to activate the subscription
    const activationData = {
      action: "activate_subscription",
      walletAddress,
      planId,
      timestamp: Date.now(),
    };

    return new Voucher(
      walletAddress, // destination
      Buffer.from(JSON.stringify(activationData))
    );
  }
}

export { SubscriptionPaymentRoute };
```

### 3.2 Payment Tracking Service (Server)

```typescript
// server/src/services/subscription-payment.service.ts
import { prisma } from ".";
import { ethers } from "ethers";
import { config } from "../configs/config";

class SubscriptionPaymentService {
  async processSubscriptionPayment(paymentData: {
    userId: number;
    planId: number;
    amount: number;
    transactionHash: string;
    duration: "monthly" | "yearly";
  }) {
    const { userId, planId, amount, transactionHash, duration } = paymentData;

    // Create subscription record
    const subscription = await prisma.userSubscriptions.create({
      data: {
        user_id: userId,
        plan_id: planId,
        status: "pending",
        start_date: new Date(),
        end_date: this.calculateEndDate(duration),
        auto_renew: true,
        payment_method: "crypto",
      },
    });

    // Create payment record
    const payment = await prisma.subscriptionPayments.create({
      data: {
        subscription_id: subscription.id,
        amount,
        transaction_hash: transactionHash,
        payment_status: "pending",
      },
    });

    // Start vault deposit monitoring
    this.monitorVaultDeposit(payment.id, transactionHash);

    return { subscription, payment };
  }

  private async monitorVaultDeposit(
    paymentId: number,
    transactionHash: string
  ) {
    // Monitor blockchain for transaction confirmation
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

    try {
      const receipt = await provider.waitForTransaction(transactionHash, 1);

      if (receipt.status === 1) {
        // Update payment status
        await prisma.subscriptionPayments.update({
          where: { id: paymentId },
          data: {
            payment_status: "confirmed",
            vault_deposit_confirmed: true,
          },
        });

        // Activate subscription
        const payment = await prisma.subscriptionPayments.findUnique({
          where: { id: paymentId },
          include: { subscription: true },
        });

        if (payment?.subscription) {
          await this.activateSubscription(payment.subscription.id);
        }
      }
    } catch (error) {
      console.error("Vault deposit monitoring failed:", error);

      await prisma.subscriptionPayments.update({
        where: { id: paymentId },
        data: { payment_status: "failed" },
      });
    }
  }

  private async activateSubscription(subscriptionId: number) {
    const subscription = await prisma.userSubscriptions.update({
      where: { id: subscriptionId },
      data: {
        status: "active",
        last_payment_date: new Date(),
        next_payment_date: this.calculateNextPaymentDate(),
      },
      include: { user: { include: { listener: true } } },
    });

    // Update listener subscription info
    if (subscription.user?.listener) {
      await prisma.listeners.update({
        where: { id: subscription.user.listener.id },
        data: {
          current_subscription_id: subscriptionId,
          subscription_tier: await this.getPlanTier(subscription.plan_id),
          ad_free_until: subscription.end_date,
        },
      });
    }

    // Log subscription history
    await prisma.subscriptionHistory.create({
      data: {
        user_id: subscription.user_id,
        subscription_id: subscriptionId,
        action: "activated",
        old_status: "pending",
        new_status: "active",
      },
    });
  }

  private calculateEndDate(duration: "monthly" | "yearly"): Date {
    const now = new Date();
    if (duration === "yearly") {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    return now;
  }

  private calculateNextPaymentDate(): Date {
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    return now;
  }

  private async getPlanTier(planId: number): Promise<number> {
    const plan = await prisma.subscriptionPlans.findUnique({
      where: { id: planId },
    });
    return plan?.tier_level || 0;
  }
}

export { SubscriptionPaymentService };
```

## 4. Frontend Integration

### 4.1 Subscription Components (Frontend)

```typescript
// frontend/components/Subscription/SubscriptionPlans.tsx
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { api } from "../../lib/api";
import { useToast } from "../../hooks/use-toast";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  tier_level: number;
  features: Record<string, boolean>;
}

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const { address } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get("/subscriptions/plans");
      setPlans(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (
    planId: number,
    duration: "monthly" | "yearly"
  ) => {
    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to subscribe",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSelectedPlan(planId);

    try {
      // Step 1: Create subscription request on server
      const subscriptionResponse = await api.post("/subscriptions/subscribe", {
        planId,
        duration,
        walletAddress: address,
      });

      const { subscription, paymentAmount } = subscriptionResponse.data.data;

      // Step 2: Process payment through Cartesi
      await processSubscriptionPayment({
        subscriptionId: subscription.id,
        planId,
        amount: paymentAmount,
        duration,
        walletAddress: address,
      });

      toast({
        title: "Success",
        description: "Subscription activated successfully!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description:
          error.response?.data?.message || "Failed to process subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const processSubscriptionPayment = async (paymentData: {
    subscriptionId: number;
    planId: number;
    amount: number;
    duration: string;
    walletAddress: string;
  }) => {
    // This function handles the Cartesi transaction
    const transactionData = {
      method: "subscription_payment",
      args: {
        subscription_id: paymentData.subscriptionId,
        plan_id: paymentData.planId,
        amount: paymentData.amount,
        duration: paymentData.duration,
        wallet_address: paymentData.walletAddress,
      },
    };

    // Send transaction to server, which forwards to Cartesi
    const response = await api.post("/transactions", transactionData);
    return response.data;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            plan.tier_level === 2 ? "border-primary" : ""
          }`}
        >
          {plan.tier_level === 2 && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              Most Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="text-2xl font-bold">
              ${plan.price_monthly}/month
            </div>
            <div className="text-sm text-muted-foreground">
              ${plan.price_yearly}/year (Save 17%)
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {Object.entries(plan.features).map(([feature, enabled]) => (
                <li
                  key={feature}
                  className={`flex items-center ${
                    enabled ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {enabled ? "✓" : "✗"}{" "}
                  {feature.replace("_", " ").toUpperCase()}
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <Button
                onClick={() => handleSubscribe(plan.id, "monthly")}
                disabled={loading && selectedPlan === plan.id}
                className="w-full"
              >
                {loading && selectedPlan === plan.id
                  ? "Processing..."
                  : "Subscribe Monthly"}
              </Button>
              <Button
                onClick={() => handleSubscribe(plan.id, "yearly")}
                disabled={loading && selectedPlan === plan.id}
                variant="outline"
                className="w-full"
              >
                Subscribe Yearly
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
```

### 4.2 Subscription Status Component

```typescript
// frontend/components/Subscription/SubscriptionStatus.tsx
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { api } from "../../lib/api";
import { useToast } from "../../hooks/use-toast";

interface UserSubscription {
  id: number;
  plan: {
    name: string;
    tier_level: number;
    features: Record<string, boolean>;
  };
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

const SubscriptionStatus: React.FC = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    if (address) {
      fetchSubscription();
    }
  }, [address]);

  const fetchSubscription = async () => {
    try {
      const response = await api.get(`/subscriptions/user/${address}`);
      setSubscription(response.data.data);
    } catch (error) {
      // User might not have a subscription
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      await api.post(`/subscriptions/${subscription.id}/cancel`);
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully",
        variant: "default",
      });
      fetchSubscription();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading subscription status...</div>;
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Subscribe to unlock premium
            features!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {subscription.plan.name} Plan
          <Badge
            variant={subscription.status === "active" ? "default" : "secondary"}
          >
            {subscription.status.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Tier {subscription.plan.tier_level} subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Valid until:</p>
            <p className="font-medium">
              {new Date(subscription.end_date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Features:</p>
            <ul className="mt-2 space-y-1">
              {Object.entries(subscription.plan.features).map(
                ([feature, enabled]) => (
                  <li
                    key={feature}
                    className={`text-sm ${
                      enabled ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {enabled ? "✓" : "✗"}{" "}
                    {feature.replace("_", " ").toUpperCase()}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Auto-renewal:</p>
              <p className="font-medium">
                {subscription.auto_renew ? "Enabled" : "Disabled"}
              </p>
            </div>

            {subscription.status === "active" && (
              <Button
                onClick={handleCancelSubscription}
                variant="destructive"
                size="sm"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
```

## 5. Complete Transaction Flow

### 5.1 Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Server      │    │ Cartesi Backend │    │ Smart Contract  │
│                 │    │                 │    │                 │    │     Vault       │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │ 1. User clicks        │                       │                       │
         │    "Subscribe"        │                       │                       │
         │                       │                       │                       │
         │ 2. POST /subscriptions│                       │                       │
         │    /subscribe         │                       │                       │
         ├──────────────────────►│                       │                       │
         │                       │ 3. Create pending     │                       │
         │                       │    subscription in DB │                       │
         │                       │                       │                       │
         │ 4. Return subscription│                       │                       │
         │    ID & payment amount│                       │                       │
         │◄──────────────────────┤                       │                       │
         │                       │                       │                       │
         │ 5. POST /transactions │                       │                       │
         │    method: 'subscription_payment'             │                       │
         ├──────────────────────►│                       │                       │
         │                       │ 6. Validate subscription                     │
         │                       │    & create Cartesi payload                  │
         │                       │                       │                       │
         │                       │ 7. Send to InputBox   │                       │
         │                       │    contract           │                       │
         │                       ├──────────────────────►│                       │
         │                       │                       │ 8. Process payment    │
         │                       │                       │    route              │
         │                       │                       │                       │
         │                       │                       │ 9. Call vault deposit │
         │                       │                       ├──────────────────────►│
         │                       │                       │                       │
         │                       │                       │10. Emit voucher for   │
         │                       │                       │    subscription       │
         │                       │                       │    activation         │
         │                       │                       │                       │
         │ 11. Return transaction│                       │                       │
         │     hash & status     │                       │                       │
         │◄──────────────────────┤                       │                       │
         │                       │                       │                       │
         │ 12. Monitor transaction                       │                       │
         │     confirmation      │                       │                       │
         │                       │                       │                       │
         │                       │13. Blockchain confirms│                       │
         │                       │    transaction        │                       │
         │                       │◄──────────────────────┤                       │
         │                       │                       │                       │
         │                       │14. Activate subscription                     │
         │                       │    in database        │                       │
         │                       │                       │                       │
         │ 15. Subscription      │                       │                       │
         │     activated!        │                       │                       │
         │◄──────────────────────┤                       │                       │
```

### 5.2 Server Transaction Handler Enhancement

```typescript
// server/src/controllers/transaction.controller.ts (Enhanced)
import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { transactionService, subscriptionService } from "../services";
import httpStatus from "http-status";

const sendTransactionRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { method, args } = req.body;

    // Handle subscription-specific transactions
    if (method === "subscription_payment") {
      const result = await handleSubscriptionPayment(args);
      res.status(httpStatus.OK).send({
        status: "success",
        data: result,
      });
      return;
    }

    // Handle other transaction types
    const result = await transactionService.addTransactionRequest(req.body);
    res.status(httpStatus.OK).send({
      status: "success",
      data: result,
    });
  }
);

const handleSubscriptionPayment = async (args: {
  subscription_id: number;
  plan_id: number;
  amount: number;
  duration: string;
  wallet_address: string;
}) => {
  try {
    // Step 1: Validate subscription exists and is pending
    const subscription = await subscriptionService.getSubscriptionById(
      args.subscription_id
    );
    if (!subscription || subscription.status !== "pending") {
      throw new Error("Invalid subscription state");
    }

    // Step 2: Create Cartesi transaction payload
    const cartesiPayload = {
      method: "subscription_payment",
      signer: args.wallet_address,
      planId: args.plan_id,
      subscriptionId: args.subscription_id,
      amount: args.amount,
      duration: args.duration,
    };

    // Step 3: Send to Cartesi backend
    const cartesiResult = await transactionService.sendToCartesi(
      cartesiPayload
    );

    // Step 4: Update subscription with transaction hash
    await subscriptionService.updateSubscriptionTransaction(
      args.subscription_id,
      cartesiResult.transactionHash
    );

    return {
      subscriptionId: args.subscription_id,
      transactionHash: cartesiResult.transactionHash,
      status: "processing",
    };
  } catch (error) {
    throw new Error(`Subscription payment failed: ${error}`);
  }
};

export { sendTransactionRequest };
```

### 5.2 Enhanced Transaction Service

```typescript
// server/src/services/transaction.service.ts (Enhanced)
import { ethers } from "ethers";
import { config } from "../configs/config";
import { prisma } from ".";

class TransactionService {
  // Existing methods...

  async sendToCartesi(payload: any) {
    try {
      // Convert payload to hex
      const hexPayload = this.objectToHex(payload);

      // Create transaction to InputBox contract
      const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      const wallet = new ethers.Wallet(config.privateKey, provider);

      const inputBoxContract = new ethers.Contract(
        config.inputBoxAddress,
        config.inputBoxABI,
        wallet
      );

      // Send transaction
      const tx = await inputBoxContract.addInput(
        config.dappAddress,
        hexPayload
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: "sent",
      };
    } catch (error) {
      throw new Error(`Failed to send to Cartesi: ${error}`);
    }
  }

  async addTransactionRequest(data: any) {
    // Handle subscription payments differently
    if (data.method === "subscription_payment") {
      return this.sendToCartesi(data);
    }

    // Existing transaction handling logic
    const message = this.createMessage(data);
    const signedMessage = await this.signMessage(message);

    return this.sendToCartesi({
      method: data.method,
      args: data.args,
      signature: signedMessage,
    });
  }

  // Existing helper methods...
  private objectToHex(obj: any): string {
    const jsonString = JSON.stringify(obj);
    return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(jsonString));
  }
}

export { TransactionService };
```

## 6. User Subscription Management

### 6.1 Subscription Management API (Server)

```typescript
// server/src/controllers/subscription.controller.ts
import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { subscriptionService } from "../services";
import httpStatus from "http-status";

const createSubscriptionPlan = catchAsync(
  async (req: Request, res: Response) => {
    const plan = await subscriptionService.createPlan(req.body);
    res.status(httpStatus.CREATED).send({
      status: "success",
      data: plan,
    });
  }
);

const getSubscriptionPlans = catchAsync(async (req: Request, res: Response) => {
  const plans = await subscriptionService.getActivePlans();
  res.status(httpStatus.OK).send({
    status: "success",
    data: plans,
  });
});

const subscribeUser = catchAsync(async (req: Request, res: Response) => {
  const { userId, planId, duration } = req.body;
  const subscription = await subscriptionService.createSubscription({
    userId,
    planId,
    duration,
  });

  res.status(httpStatus.CREATED).send({
    status: "success",
    data: subscription,
  });
});

const getUserSubscription = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const subscription = await subscriptionService.getUserActiveSubscription(
    parseInt(userId)
  );

  res.status(httpStatus.OK).send({
    status: "success",
    data: subscription,
  });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const result = await subscriptionService.cancelSubscription(
    parseInt(subscriptionId)
  );

  res.status(httpStatus.OK).send({
    status: "success",
    data: result,
  });
});

export {
  createSubscriptionPlan,
  getSubscriptionPlans,
  subscribeUser,
  getUserSubscription,
  cancelSubscription,
};
```

### 4.2 Subscription Renewal Service

```typescript
// server/src/services/subscription-renewal.service.ts
import { prisma } from ".";
import { SubscriptionPaymentService } from "./subscription-payment.service";

class SubscriptionRenewalService {
  private paymentService = new SubscriptionPaymentService();

  async processRenewals() {
    // Find subscriptions expiring in the next 24 hours
    const expiringSubscriptions = await prisma.userSubscriptions.findMany({
      where: {
        status: "active",
        auto_renew: true,
        end_date: {
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
        },
      },
      include: {
        user: true,
        plan: true,
      },
    });

    for (const subscription of expiringSubscriptions) {
      await this.processRenewal(subscription);
    }
  }

  private async processRenewal(subscription: any) {
    try {
      // Check if user has sufficient balance or payment method
      const canRenew = await this.checkRenewalEligibility(subscription);

      if (canRenew) {
        // Process renewal payment
        await this.paymentService.processSubscriptionPayment({
          userId: subscription.user_id,
          planId: subscription.plan_id,
          amount: subscription.plan.price_monthly,
          transactionHash: "", // Will be generated by payment process
          duration: "monthly",
        });

        // Log renewal
        await prisma.subscriptionHistory.create({
          data: {
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            action: "renewed",
            old_status: "active",
            new_status: "active",
          },
        });
      } else {
        // Mark as expired
        await this.expireSubscription(subscription.id);
      }
    } catch (error) {
      console.error(
        `Renewal failed for subscription ${subscription.id}:`,
        error
      );
      await this.expireSubscription(subscription.id);
    }
  }

  private async checkRenewalEligibility(subscription: any): Promise<boolean> {
    // Implement logic to check if user can renew
    // This could involve checking wallet balance, payment history, etc.
    return true; // Simplified for now
  }

  private async expireSubscription(subscriptionId: number) {
    await prisma.userSubscriptions.update({
      where: { id: subscriptionId },
      data: { status: "expired" },
    });

    // Update listener subscription info
    const subscription = await prisma.userSubscriptions.findUnique({
      where: { id: subscriptionId },
      include: { user: { include: { listener: true } } },
    });

    if (subscription?.user?.listener) {
      await prisma.listeners.update({
        where: { id: subscription.user.listener.id },
        data: {
          subscription_tier: 0, // Free tier
          ad_free_until: null,
        },
      });
    }
  }
}

export { SubscriptionRenewalService };
```

## 5. Access Control Implementation

### 5.1 Subscription Middleware

```typescript
// server/src/middlewares/subscription.middleware.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../services";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    walletAddress: string;
  };
}

const requireSubscription = (minTier: number = 1) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          listener: {
            include: {
              currentSubscription: {
                include: { plan: true },
              },
            },
          },
        },
      });

      if (!user?.listener) {
        throw new ApiError(httpStatus.FORBIDDEN, "Listener profile required");
      }

      const subscription = user.listener.currentSubscription;

      if (
        !subscription ||
        subscription.status !== "active" ||
        new Date(subscription.end_date) < new Date()
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Active subscription required"
        );
      }

      if (subscription.plan.tier_level < minTier) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Subscription tier ${minTier} or higher required`
        );
      }

      // Add subscription info to request
      (req as any).subscription = subscription;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const checkFeatureAccess = (feature: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const subscription = (req as any).subscription;

      if (!subscription) {
        throw new ApiError(httpStatus.FORBIDDEN, "Subscription required");
      }

      const features = subscription.plan.features as Record<string, boolean>;

      if (!features[feature]) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Feature '${feature}' not available in current plan`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { requireSubscription, checkFeatureAccess };
```

### 5.2 Protected Routes Implementation

```typescript
// server/src/routes/protected-content.route.ts
import express from "express";
import {
  requireSubscription,
  checkFeatureAccess,
} from "../middlewares/subscription.middleware";
import { contentController } from "../controllers";

const router = express.Router();

// High-quality audio streaming (Premium tier required)
router.get(
  "/tracks/:id/high-quality",
  requireSubscription(2), // Premium tier
  checkFeatureAccess("high_quality_audio"),
  contentController.getHighQualityTrack
);

// Unlimited downloads (Pro tier required)
router.post(
  "/tracks/:id/download",
  requireSubscription(3), // Pro tier
  checkFeatureAccess("unlimited_downloads"),
  contentController.downloadTrack
);

// Ad-free experience (Basic tier or higher)
router.get(
  "/content/ad-free",
  requireSubscription(1), // Basic tier
  checkFeatureAccess("ad_free"),
  contentController.getAdFreeContent
);

export default router;
```

## 6. Ad Display System Integration

### 6.1 Ad Rules Engine

```typescript
// server/src/services/ad-display.service.ts
import { prisma } from ".";

interface AdDisplayRules {
  showAds: boolean;
  adFrequency: number; // ads per hour
  adTypes: string[];
  maxAdDuration: number; // seconds
}

class AdDisplayService {
  async getAdDisplayRules(userId: number): Promise<AdDisplayRules> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        listener: {
          include: {
            currentSubscription: {
              include: { plan: true },
            },
          },
        },
      },
    });

    if (!user?.listener) {
      return this.getFreeUserAdRules();
    }

    const subscription = user.listener.currentSubscription;

    if (
      !subscription ||
      subscription.status !== "active" ||
      new Date(subscription.end_date) < new Date()
    ) {
      return this.getFreeUserAdRules();
    }

    return this.getSubscriptionAdRules(
      subscription.plan.tier_level,
      subscription.plan.features
    );
  }

  private getFreeUserAdRules(): AdDisplayRules {
    return {
      showAds: true,
      adFrequency: 6, // 6 ads per hour
      adTypes: ["audio", "banner", "video"],
      maxAdDuration: 30,
    };
  }

  private getSubscriptionAdRules(
    tierLevel: number,
    features: any
  ): AdDisplayRules {
    const baseRules: AdDisplayRules = {
      showAds: !features.ad_free,
      adFrequency: 0,
      adTypes: [],
      maxAdDuration: 0,
    };

    if (features.ad_free) {
      return baseRules;
    }

    // Reduced ads for paid tiers
    switch (tierLevel) {
      case 1: // Basic
        return {
          ...baseRules,
          showAds: true,
          adFrequency: 2, // 2 ads per hour
          adTypes: ["banner"],
          maxAdDuration: 15,
        };
      case 2: // Premium
        return {
          ...baseRules,
          showAds: true,
          adFrequency: 1, // 1 ad per hour
          adTypes: ["banner"],
          maxAdDuration: 10,
        };
      default:
        return baseRules;
    }
  }

  async shouldShowAd(userId: number, lastAdTime?: Date): Promise<boolean> {
    const rules = await this.getAdDisplayRules(userId);

    if (!rules.showAds) {
      return false;
    }

    if (!lastAdTime) {
      return true;
    }

    const hoursSinceLastAd =
      (Date.now() - lastAdTime.getTime()) / (1000 * 60 * 60);
    const adInterval = 1 / rules.adFrequency; // hours between ads

    return hoursSinceLastAd >= adInterval;
  }
}

export { AdDisplayService };
```

### 6.2 Ad Display API

```typescript
// server/src/controllers/ad.controller.ts
import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { adDisplayService } from "../services";
import httpStatus from "http-status";

const getAdDisplayRules = catchAsync(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const rules = await adDisplayService.getAdDisplayRules(userId);

  res.status(httpStatus.OK).send({
    status: "success",
    data: rules,
  });
});

const checkAdEligibility = catchAsync(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { lastAdTime } = req.body;

  const shouldShow = await adDisplayService.shouldShowAd(
    userId,
    lastAdTime ? new Date(lastAdTime) : undefined
  );

  res.status(httpStatus.OK).send({
    status: "success",
    data: { shouldShowAd: shouldShow },
  });
});

export { getAdDisplayRules, checkAdEligibility };
```

## 7. Smart Contract Modifications

### 7.1 Enhanced Vault Contract

```solidity
// smart-contract/contracts/MelodiousVaultV2.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MelodiousVaultV2 is ReentrancyGuard, Ownable {
    IERC20 public immutable ctsiToken;

    // Subscription-related storage
    mapping(address => uint256) public subscriptionBalances;
    mapping(address => uint256) public lastSubscriptionPayment;

    // Events
    event SubscriptionDeposit(address indexed user, uint256 amount, uint256 planId);
    event SubscriptionWithdrawal(address indexed admin, address indexed to, uint256 amount);
    event SubscriptionActivated(address indexed user, uint256 planId, uint256 duration);

    constructor(IERC20 _ctsiToken) {
        ctsiToken = _ctsiToken;
    }

    // Deposit for subscription payment
    function depositForSubscription(
        uint256 amount,
        uint256 planId
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(planId > 0, "Invalid plan ID");

        bool success = ctsiToken.transferFrom(msg.sender, address(this), amount);
        require(success, "CTSI token transfer failed");

        subscriptionBalances[msg.sender] += amount;
        lastSubscriptionPayment[msg.sender] = block.timestamp;

        emit SubscriptionDeposit(msg.sender, amount, planId);
    }

    // Admin function to withdraw subscription payments
    function withdrawSubscriptionFunds(
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        require(ctsiToken.balanceOf(address(this)) >= amount, "Insufficient contract balance");

        bool success = ctsiToken.transfer(to, amount);
        require(success, "CTSI token transfer failed");

        emit SubscriptionWithdrawal(msg.sender, to, amount);
    }

    // Get subscription balance for a user
    function getSubscriptionBalance(address user) external view returns (uint256) {
        return subscriptionBalances[user];
    }

    // Get total contract balance
    function getTotalBalance() external view returns (uint256) {
        return ctsiToken.balanceOf(address(this));
    }
}
```

## 8. API Specifications

### 8.1 Subscription Management Endpoints

```yaml
# API Documentation (OpenAPI 3.0)
openapi: 3.0.0
info:
  title: Melodious Subscription API
  version: 1.0.0
  description: Subscription management system for Melodious platform

paths:
  /api/subscriptions/plans:
    get:
      summary: Get all active subscription plans
      responses:
        200:
          description: List of subscription plans
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/SubscriptionPlan"

    post:
      summary: Create a new subscription plan (Admin only)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreatePlanRequest"
      responses:
        201:
          description: Plan created successfully

  /api/subscriptions/subscribe:
    post:
      summary: Subscribe user to a plan
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                planId:
                  type: integer
                duration:
                  type: string
                  enum: [monthly, yearly]
                paymentMethod:
                  type: string
                  default: crypto
      responses:
        201:
          description: Subscription created

  /api/subscriptions/user/{userId}:
    get:
      summary: Get user's active subscription
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
      responses:
        200:
          description: User subscription details

  /api/subscriptions/{subscriptionId}/cancel:
    post:
      summary: Cancel a subscription
      parameters:
        - name: subscriptionId
          in: path
          required: true
          schema:
            type: integer
      responses:
        200:
          description: Subscription cancelled

  /api/ads/rules/{userId}:
    get:
      summary: Get ad display rules for user
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
      responses:
        200:
          description: Ad display rules
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AdDisplayRules"

components:
  schemas:
    SubscriptionPlan:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        description:
          type: string
        price_monthly:
          type: number
        price_yearly:
          type: number
        tier_level:
          type: integer
        features:
          type: object
        is_active:
          type: boolean

    CreatePlanRequest:
      type: object
      required:
        - name
        - price_monthly
        - tier_level
        - features
      properties:
        name:
          type: string
        description:
          type: string
        price_monthly:
          type: number
        price_yearly:
          type: number
        tier_level:
          type: integer
        features:
          type: object

    AdDisplayRules:
      type: object
      properties:
        showAds:
          type: boolean
        adFrequency:
          type: integer
        adTypes:
          type: array
          items:
            type: string
        maxAdDuration:
          type: integer
```

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// server/tests/subscription.test.ts
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { SubscriptionPaymentService } from "../src/services/subscription-payment.service";
import { prisma } from "../src/services";

describe("Subscription Payment Service", () => {
  let service: SubscriptionPaymentService;

  beforeEach(() => {
    service = new SubscriptionPaymentService();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.subscriptionPayments.deleteMany();
    await prisma.userSubscriptions.deleteMany();
  });

  it("should create subscription payment record", async () => {
    const paymentData = {
      userId: 1,
      planId: 1,
      amount: 10,
      transactionHash: "0x123",
      duration: "monthly" as const,
    };

    const result = await service.processSubscriptionPayment(paymentData);

    expect(result.subscription).toBeDefined();
    expect(result.payment).toBeDefined();
    expect(result.subscription.status).toBe("pending");
  });

  it("should activate subscription after payment confirmation", async () => {
    // Test implementation
  });
});
```

### 9.2 Integration Tests

```typescript
// server/tests/integration/subscription-flow.test.ts
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/services";

describe("Subscription Flow Integration", () => {
  it("should complete full subscription flow", async () => {
    // 1. Create subscription plan
    const planResponse = await request(app)
      .post("/api/subscriptions/plans")
      .send({
        name: "Test Plan",
        price_monthly: 10,
        tier_level: 1,
        features: { ad_free: true },
      })
      .expect(201);

    // 2. Subscribe user
    const subscribeResponse = await request(app)
      .post("/api/subscriptions/subscribe")
      .send({
        planId: planResponse.body.data.id,
        duration: "monthly",
      })
      .expect(201);

    // 3. Verify subscription created
    expect(subscribeResponse.body.data.status).toBe("pending");

    // 4. Test payment processing
    // 5. Verify subscription activation
    // 6. Test access control
  });
});
```

## 10. Deployment Strategy

### 10.1 Database Migration

```sql
-- migrations/001_create_subscription_tables.sql
BEGIN;

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  tier_level INTEGER NOT NULL,
  features JSONB NOT NULL,
  max_downloads INTEGER DEFAULT 0,
  max_playlists INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(50) DEFAULT 'crypto',
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription payments table
CREATE TABLE IF NOT EXISTS subscription_payments (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CTSI',
  transaction_hash VARCHAR(66),
  vault_deposit_confirmed BOOLEAN DEFAULT false,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  subscription_id INTEGER REFERENCES user_subscriptions(id),
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update listeners table
ALTER TABLE listeners ADD COLUMN IF NOT EXISTS current_subscription_id INTEGER REFERENCES user_subscriptions(id);
ALTER TABLE listeners ADD COLUMN IF NOT EXISTS subscription_tier INTEGER DEFAULT 0;
ALTER TABLE listeners ADD COLUMN IF NOT EXISTS ad_free_until TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, tier_level, features) VALUES
('Basic', 'Ad-free listening with basic features', 4.99, 49.99, 1, '{"ad_free": true, "high_quality": false, "unlimited_downloads": false}'),
('Premium', 'High-quality audio and reduced ads', 9.99, 99.99, 2, '{"ad_free": true, "high_quality": true, "unlimited_downloads": false}'),
('Pro', 'All features including unlimited downloads', 14.99, 149.99, 3, '{"ad_free": true, "high_quality": true, "unlimited_downloads": true}');

COMMIT;
```

### 10.2 Deployment Steps

1. **Database Migration**

   ```bash
   # Run database migrations
   npm run migrate:up

   # Verify migration
   npm run migrate:status
   ```

2. **Smart Contract Deployment**

   ```bash
   cd smart-contract
   npx hardhat compile
   npx hardhat deploy --network localhost
   ```

3. **Cartesi Backend Update**

   ```bash
   cd cartesi-backend
   cartesi build
   cartesi run --epoch-duration 5
   ```

4. **Server Deployment**

   ```bash
   cd server
   npm run build
   npm run start:prod
   ```

5. **Frontend Integration**
   ```bash
   cd frontend
   npm run build
   npm run start
   ```

## 11. Monitoring and Analytics

### 11.1 Subscription Metrics

```typescript
// server/src/services/subscription-analytics.service.ts
import { prisma } from ".";

class SubscriptionAnalyticsService {
  async getSubscriptionMetrics(dateRange: { start: Date; end: Date }) {
    const metrics = await prisma.$transaction([
      // Total active subscriptions
      prisma.userSubscriptions.count({
        where: {
          status: "active",
          created_at: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),

      // Revenue by plan
      prisma.subscriptionPayments.groupBy({
        by: ["subscription_id"],
        _sum: { amount: true },
        where: {
          payment_status: "confirmed",
          created_at: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),

      // Churn rate
      prisma.userSubscriptions.count({
        where: {
          status: "cancelled",
          updated_at: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
    ]);

    return {
      activeSubscriptions: metrics[0],
      totalRevenue: metrics[1].reduce(
        (sum, item) => sum + (item._sum.amount || 0),
        0
      ),
      churnedSubscriptions: metrics[2],
    };
  }
}

export { SubscriptionAnalyticsService };
```

## 12. Security Considerations

### 12.1 Payment Security

- **Transaction Verification**: All payments are verified through blockchain transaction receipts
- **Vault Monitoring**: Real-time monitoring of vault deposits with automatic reconciliation
- **Access Control**: Role-based permissions for subscription management
- **Data Encryption**: Sensitive subscription data encrypted at rest

### 12.2 Smart Contract Security

- **Reentrancy Protection**: All external calls protected with ReentrancyGuard
- **Access Control**: Admin-only functions for fund management
- **Input Validation**: Comprehensive validation of all function parameters
- **Upgrade Path**: Proxy pattern for contract upgrades

## 13. Performance Optimization

### 13.1 Database Optimization

- **Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: Optimized database connection management
- **Query Optimization**: Efficient queries with proper joins and aggregations
- **Caching**: Redis caching for frequently accessed subscription data

### 13.2 API Performance

- **Rate Limiting**: API rate limiting to prevent abuse
- **Response Caching**: Caching of subscription plan data
- **Pagination**: Efficient pagination for large datasets
- **Async Processing**: Background processing for payment verification

## Conclusion

This comprehensive technical proposal provides a robust foundation for implementing a subscription management system within the Melodious platform. The solution maintains consistency with existing architectural patterns while introducing powerful new capabilities for monetization and user engagement.

The implementation follows established patterns from the current codebase, particularly the vault deposit mechanism and transaction processing flow. The system is designed to be scalable, secure, and maintainable, with comprehensive testing and monitoring capabilities.

Key benefits of this implementation:

1. **Seamless Integration**: Builds upon existing Cartesi and server infrastructure
2. **Scalable Architecture**: Designed to handle growth in users and transactions
3. **Flexible Subscription Plans**: Support for multiple tiers and features
4. **Robust Payment Processing**: Secure, verifiable payment handling
5. **Comprehensive Access Control**: Granular permissions based on subscription tiers
6. **Dynamic Ad Management**: Intelligent ad display based on subscription status
7. **Real-time Monitoring**: Complete audit trails and analytics

The proposed system will enable Melodious to offer premium features while maintaining a free tier, creating sustainable revenue streams and enhanced user experiences.
