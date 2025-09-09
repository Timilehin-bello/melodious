// Subscription Plan Types
export interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
  payments: SubscriptionPayment[];
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
}

// Payment Types
export interface SubscriptionPayment {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentId: string;
  status: PaymentStatus;
  paymentData?: Record<string, any>;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethod {
  CRYPTO = "CRYPTO",
  CREDIT_CARD = "CREDIT_CARD",
  PAYPAL = "PAYPAL",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

// API Request/Response Types
export interface CreateSubscriptionRequest {
  planType: string;
  paymentMethod: PaymentMethod;
  paymentId: string;
  autoRenew?: boolean;
}

export interface CreateSubscriptionResponse {
  status: string;
  message: string;
  data: Subscription;
}

export interface ProcessPaymentRequest {
  subscriptionId: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentId: string;
  paymentData?: Record<string, any>;
}

export interface ProcessPaymentResponse {
  status: string;
  message: string;
  data: SubscriptionPayment;
}

export interface UpdateSubscriptionRequest {
  status?: SubscriptionStatus;
  autoRenew?: boolean;
  cancelReason?: string;
}

export interface UpdateSubscriptionResponse {
  status: string;
  message: string;
  data: Subscription;
}

export interface GetSubscriptionsQuery {
  status?: SubscriptionStatus;
  limit?: number;
  offset?: number;
}

export interface GetSubscriptionsResponse {
  status: string;
  data: {
    subscriptions: Subscription[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface GetSubscriptionPlansResponse {
  status: string;
  data: SubscriptionPlan[];
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
}

export interface CreateSubscriptionPlanResponse {
  status: string;
  message: string;
  data: SubscriptionPlan;
}

// Hook Types
export interface UseSubscriptionsOptions {
  status?: SubscriptionStatus;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export interface UseSubscriptionOptions {
  subscriptionId: number;
  enabled?: boolean;
}

// Error Types
export interface SubscriptionError {
  status: string;
  message: string;
  errors?: string[];
}

// Utility Types
export type SubscriptionFormData = Omit<
  CreateSubscriptionRequest,
  "paymentId"
> & {
  paymentId?: string;
};

export type PaymentFormData = Omit<ProcessPaymentRequest, "subscriptionId"> & {
  subscriptionId?: number;
};

export type SubscriptionUpdateFormData = UpdateSubscriptionRequest;
