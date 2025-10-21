import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCartesiSubscriptionStatus } from "./useCartesiSubscription";
import { useMelodiousContext } from "@/contexts/melodious";
import { useActiveAccount } from "thirdweb/react";

// Ad preferences interface
interface AdPreferences {
  id: string;
  userId: string;
  showAds: boolean;
  adFrequency: "low" | "medium" | "high";
  personalizedAds: boolean;
  createdAt: string;
  updatedAt: string;
}

// Ad analytics interface
interface AdAnalytics {
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number; // Click-through rate
}

// Query keys for ad-related queries
export const adQueryKeys = {
  all: ["ads"] as const,
  preferences: () => [...adQueryKeys.all, "preferences"] as const,
  analytics: () => [...adQueryKeys.all, "analytics"] as const,
  shouldShowAds: () => [...adQueryKeys.all, "shouldShow"] as const,
};

// Hook to determine if ads should be shown
export const useShouldShowAds = () => {
  const { isLoggedIn, userData } = useMelodiousContext();
  const activeAccount = useActiveAccount();
  const { data: subscriptionStatus, isLoading: subscriptionLoading } = 
    useCartesiSubscriptionStatus(activeAccount?.address);

  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription || false;
  const isPremiumUser = hasActiveSubscription;

  return useQuery({
    queryKey: adQueryKeys.shouldShowAds(),
    queryFn: () => {
      // Don't show ads if:
      // 1. User is not logged in
      // 2. User has active premium subscription
      // 3. User is premium user
      if (!isLoggedIn || hasActiveSubscription || isPremiumUser) {
        return {
          shouldShow: false,
          reason: !isLoggedIn ? "not_logged_in" : "premium_user",
        };
      }

      return {
        shouldShow: true,
        reason: "free_user",
      };
    },
    enabled: !subscriptionLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Utility hook that combines subscription status for ad display logic
export const useAdDisplayLogic = () => {
  const { data: shouldShowAds, isLoading: adsLoading } = useShouldShowAds();
  const activeAccount = useActiveAccount();
  const { data: subscriptionStatus } = useCartesiSubscriptionStatus(activeAccount?.address);
  
  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription || false;
  const isPremiumUser = hasActiveSubscription;

  const canShowAds =
    shouldShowAds?.shouldShow && !hasActiveSubscription && !isPremiumUser;

  return {
    canShowAds,
    shouldShowAds: shouldShowAds?.shouldShow || false,
    isLoading: adsLoading,
    reason: shouldShowAds?.reason,
  };
};
