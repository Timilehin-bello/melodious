import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";
import { useMelodiousContext } from "@/contexts/melodious";
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  UpdateSubscriptionRequest,
  UpdateSubscriptionResponse,
  GetSubscriptionsQuery,
  GetSubscriptionsResponse,
  GetSubscriptionPlansResponse,
  UseSubscriptionsOptions,
  UseSubscriptionOptions,
} from "@/types/subscription";
import { toast } from "react-hot-toast";

// Query Keys
export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  lists: () => [...subscriptionKeys.all, "list"] as const,
  list: (filters: GetSubscriptionsQuery) =>
    [...subscriptionKeys.lists(), filters] as const,
  details: () => [...subscriptionKeys.all, "detail"] as const,
  detail: (id: number) => [...subscriptionKeys.details(), id] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
};

// Get current user's subscriptions
export function useSubscriptions(options: UseSubscriptionsOptions = {}) {
  const { status, limit = 10, offset = 0, enabled = true } = options;

  return useQuery({
    queryKey: subscriptionKeys.list({ status, limit, offset }),
    queryFn: async (): Promise<GetSubscriptionsResponse> => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      const response = await apiClient.get(
        `/subscriptions?${params.toString()}`
      );
      return response.data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get specific subscription by ID
export function useSubscription(options: UseSubscriptionOptions) {
  const { subscriptionId, enabled = true } = options;

  return useQuery({
    queryKey: subscriptionKeys.detail(subscriptionId),
    queryFn: async (): Promise<Subscription> => {
      const response = await apiClient.get(`/subscriptions/${subscriptionId}`);
      return response.data.data;
    },
    enabled: enabled && !!subscriptionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get available subscription plans
export function useSubscriptionPlans(enabled = true) {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const response = await apiClient.get("/subscriptions/plans");
      const plans = response.data.data;

      // Parse features from JSON string to array
      return plans.map((plan: any) => ({
        ...plan,
        features:
          typeof plan.features === "string"
            ? JSON.parse(plan.features)
            : plan.features || [],
      }));
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes - plans don't change often
  });
}

// Create new subscription
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateSubscriptionRequest
    ): Promise<CreateSubscriptionResponse> => {
      const response = await apiClient.post("/subscriptions", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch subscriptions
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });

      // Add the new subscription to the cache
      queryClient.setQueryData(
        subscriptionKeys.detail(data.data.id),
        data.data
      );

      toast.success("Subscription created successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to create subscription:", error);
      // Error toast is handled by the global interceptor
    },
  });
}

// Process subscription payment
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: ProcessPaymentRequest
    ): Promise<ProcessPaymentResponse> => {
      const response = await apiClient.post("/subscriptions/payment", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate subscription details to refetch updated payment info
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.detail(variables.subscriptionId),
      });

      // Invalidate subscriptions list
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });

      toast.success("Payment processed successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to process payment:", error);
      // Error toast is handled by the global interceptor
    },
  });
}

// Update subscription (cancel, renew, etc.)
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      data,
    }: {
      subscriptionId: number;
      data: UpdateSubscriptionRequest;
    }): Promise<UpdateSubscriptionResponse> => {
      const response = await apiClient.patch(
        `/subscriptions/${subscriptionId}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific subscription in cache
      queryClient.setQueryData(
        subscriptionKeys.detail(variables.subscriptionId),
        data.data
      );

      // Invalidate subscriptions list to refetch
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });

      toast.success("Subscription updated successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to update subscription:", error);
      // Error toast is handled by the global interceptor
    },
  });
}

// Cancel subscription
export function useCancelSubscription() {
  const updateSubscription = useUpdateSubscription();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      cancelReason,
    }: {
      subscriptionId: number;
      cancelReason?: string;
    }) => {
      return updateSubscription.mutateAsync({
        subscriptionId,
        data: {
          status: SubscriptionStatus.CANCELLED,
          autoRenew: false,
          cancelReason,
        },
      });
    },
    onSuccess: () => {
      toast.success("Subscription cancelled successfully!");
    },
  });
}

// Reactivate subscription
export function useReactivateSubscription() {
  const updateSubscription = useUpdateSubscription();

  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      return updateSubscription.mutateAsync({
        subscriptionId,
        data: {
          status: SubscriptionStatus.ACTIVE,
          autoRenew: true,
        },
      });
    },
    onSuccess: () => {
      toast.success("Subscription reactivated successfully!");
    },
  });
}

// Custom hook for subscription status checks
export function useSubscriptionStatus() {
  const { isLoggedIn } = useMelodiousContext();

  // Get all subscriptions (not just ACTIVE ones) to find any subscription that might have vouchers
  // Only make the API call if the user is authenticated
  const { data: subscriptions, isLoading } = useSubscriptions({
    limit: 10, // Get more subscriptions to find the most recent one
    enabled: Boolean(isLoggedIn), // Only fetch when user is logged in
  });

  // Find the most recent subscription (could be ACTIVE, PENDING, etc.)
  const allSubscriptions = subscriptions?.data?.subscriptions || [];
  const activeSubscription =
    allSubscriptions.find((sub) => sub.status === SubscriptionStatus.ACTIVE) ||
    allSubscriptions[0];

  const hasActiveSubscription =
    !!activeSubscription &&
    activeSubscription.status === SubscriptionStatus.ACTIVE;
  const isSubscriptionExpired = activeSubscription
    ? new Date(activeSubscription.endDate) < new Date()
    : false;

  return {
    activeSubscription,
    hasActiveSubscription,
    isSubscriptionExpired,
    isLoading,
    isPremiumUser: hasActiveSubscription && !isSubscriptionExpired,
  };
}
