import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";
import { useMelodiousContext } from "@/contexts/melodious";
import { toast } from "react-hot-toast";
import { useActiveAccount } from "thirdweb/react";
import {
  useNoticesQuery,
  useRepositoryData,
  noticesKeys,
} from "./useNoticesQuery";
import { useMemo } from "react";

// Referral types
export interface ReferralStats {
  user: {
    walletAddress: string;
    name: string;
    referralCode: string;
    currentMeloPoints: number;
    totalReferrals: number;
  };
  statistics: {
    totalReferrals: number;
    totalPointsEarned: number;
    totalPointsConverted: number;
    totalCtsiReceived: number;
    currentBalance: number;
  };
  recentReferrals: Array<{
    id: string;
    referredWalletAddress: string;
    referredName: string;
    referrerName: string;
    pointsEarned: number;
    createdAt: string;
    completedAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    type: "EARNED" | "CONVERSION";
    meloPoints: number;
    ctsiAmount?: number;
    description: string;
    createdAt: string;
  }>;
}

export interface ReferralTransaction {
  id: string;
  type: "EARNED" | "CONVERSION";
  meloPoints: number;
  ctsiAmount?: number;
  conversionRate?: number;
  referralId?: string;
  description: string;
  createdAt: string;
}

export interface ConversionInfo {
  conversionRate: number;
  minConversion: number;
  maxDailyConversion: number;
  referralPoints: number;
}

export interface ReferralValidation {
  valid: boolean;
  referrer: {
    walletAddress: string;
    name: string;
    username: string;
    totalReferrals: number;
  };
  pointsToEarn: number;
}

// Query Keys
export const referralKeys = {
  all: ["referrals"] as const,
  stats: (walletAddress?: string) =>
    [...referralKeys.all, "stats", walletAddress] as const,
  transactions: (walletAddress?: string) =>
    [...referralKeys.all, "transactions", walletAddress] as const,
  conversionInfo: () => [...referralKeys.all, "conversionInfo"] as const,
  validation: (code: string) =>
    [...referralKeys.all, "validation", code] as const,
};

// Hook to get referral statistics
export const useReferralStats = (walletAddress?: string) => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: referralKeys.stats(walletAddress),
    queryFn: async (): Promise<ReferralStats> => {
      if (!walletAddress || !repositoryData) {
        throw new Error(
          "Wallet address not provided or repository data not available"
        );
      }

      const { referrals, referralTransactions, users } = repositoryData;

      // Find user by wallet address
      const user = users.find(
        (u: any) =>
          u.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
      );

      if (!user) {
        // Return default stats structure
        return {
          user: {
            walletAddress: walletAddress,
            name: "Unknown User",
            referralCode: "",
            currentMeloPoints: 0,
            totalReferrals: 0,
          },
          statistics: {
            totalReferrals: 0,
            totalPointsEarned: 0,
            totalPointsConverted: 0,
            totalCtsiReceived: 0,
            currentBalance: 0,
          },
          recentReferrals: [],
          recentTransactions: [],
        };
      }

      // Get referrals where this user is the referrer
      const userReferrals = referrals.filter(
        (r: any) =>
          r.referrerWalletAddress?.toLowerCase() === walletAddress.toLowerCase()
      );

      // Get referral transactions for this user
      const userTransactions = referralTransactions.filter(
        (t: any) =>
          t.userWalletAddress?.toLowerCase() === walletAddress.toLowerCase()
      );

      // Calculate stats
      const totalPointsEarned = userTransactions
        .filter((t: any) => t.type === "EARNED")
        .reduce((sum: number, t: any) => sum + (t.meloPoints || 0), 0);

      const totalCtsiReceived = userTransactions
        .filter((t: any) => t.type === "CONVERSION")
        .reduce((sum: number, t: any) => sum + (t.ctsiAmount || 0), 0);

      const totalPointsConverted = userTransactions
        .filter((t: any) => t.type === "CONVERSION")
        .reduce((sum: number, t: any) => sum + (t.meloPoints || 0), 0);

      // Get recent referrals with referred user info
      const recentReferrals = userReferrals
        // .slice(-5) // Last 5 referrals
        .map((referral: any) => ({
          id: referral.id,
          referredWalletAddress: referral.referredWalletAddress,
          referredName: referral.referredName || "Unknown User",
          referrerName: referral.referrerName || "Unknown",
          pointsEarned:
            referral.pointsEarned ||
            referral.meloPointsEarned ||
            repositoryData.config?.referralPoints ||
            100,
          createdAt: referral.createdAt,
          completedAt: referral.completedAt || referral.createdAt,
        }))
        .reverse();

      // Get recent transactions
      const recentTransactions = userTransactions
        // .slice(-10) // Last 10 transactions
        .map((transaction: any) => ({
          id: transaction.id,
          type: transaction.type,
          meloPoints: transaction.meloPoints || 0,
          ctsiAmount: transaction.ctsiAmount,
          description:
            transaction.description || `${transaction.type} transaction`,
          createdAt: transaction.createdAt,
        }))
        .reverse();

      return {
        user: {
          walletAddress: user.walletAddress,
          name: user.name,
          referralCode: user.referralCode || "",
          currentMeloPoints: user.meloPoints || 0,
          totalReferrals: userReferrals.length,
        },
        statistics: {
          totalReferrals: userReferrals.length,
          totalPointsEarned,
          totalPointsConverted,
          totalCtsiReceived,
          currentBalance: user.meloPoints || 0,
        },
        recentReferrals,
        recentTransactions,
      };
    },
    enabled: !!walletAddress && !!repositoryData && !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get referral transactions
export const useReferralTransactions = (walletAddress?: string) => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: referralKeys.transactions(walletAddress),
    queryFn: async (): Promise<ReferralTransaction[]> => {
      if (!walletAddress || !repositoryData) {
        throw new Error(
          "Wallet address not provided or repository data not available"
        );
      }

      const { referralTransactions } = repositoryData;

      // Filter transactions for this wallet address
      const userTransactions = referralTransactions.filter(
        (t: any) =>
          t.userWalletAddress?.toLowerCase() === walletAddress.toLowerCase()
      );

      // Transform repository transactions into the expected format
      const transactions: ReferralTransaction[] = userTransactions
        .map((transaction: any) => {
          return {
            id: transaction.id,
            type: transaction.type,
            meloPoints: transaction.meloPoints || 0,
            ctsiAmount: transaction.ctsiAmount,
            conversionRate: transaction.conversionRate,
            referralId: transaction.referralId,
            description:
              transaction.description || `${transaction.type} transaction`,
            createdAt: transaction.createdAt,
          };
        })
        .reverse();

      return transactions;
    },
    enabled: !!walletAddress && !!repositoryData && !!activeAccount,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

// Hook to get conversion information
export const useConversionInfo = () => {
  const { repositoryData } = useRepositoryData();

  return useQuery({
    queryKey: referralKeys.conversionInfo(),
    queryFn: async (): Promise<ConversionInfo> => {
      if (!repositoryData) {
        throw new Error("Repository data not available");
      }

      // Get conversion info from config in repository data or use defaults
      const config = repositoryData.config;
      const conversionInfo = config
        ? {
            conversionRate: config.conversionRate,
            minConversion: config.minConversion,
            maxDailyConversion: config.maxDailyConversion,
            referralPoints: config.referralPoints,
          }
        : {
            conversionRate: 0.001, // Default rate: 1000 Melo = 1 CTSI
            minConversion: 1000,
            maxDailyConversion: 10000,
            referralPoints: 100,
          };

      return conversionInfo;
    },
    enabled: !!repositoryData,
    staleTime: 10 * 60 * 1000, // 10 minutes (conversion rates don't change often)
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook to validate referral code
export const useValidateReferralCode = (referralCode: string) => {
  const { repositoryData } = useRepositoryData();

  return useQuery({
    queryKey: referralKeys.validation(referralCode),
    queryFn: async (): Promise<ReferralValidation> => {
      if (!referralCode.trim() || !repositoryData) {
        throw new Error(
          "Referral code not provided or repository data not available"
        );
      }

      // Find user with matching referral code from repository data
      const referrer = repositoryData.users?.find(
        (user: any) => user.referralCode === referralCode.trim()
      );

      if (!referrer) {
        return {
          valid: false,
          referrer: {
            walletAddress: "",
            name: "",
            username: "",
            totalReferrals: 0,
          },
          pointsToEarn: 0,
        };
      }

      return {
        valid: true,
        referrer: {
          walletAddress: referrer.walletAddress,
          name: referrer.name,
          username: referrer.username,
          totalReferrals: referrer.totalReferrals || 0,
        },
        pointsToEarn: repositoryData.config?.referralPoints || 100, // Get from config or use default
      };
    },
    enabled: !!referralCode.trim() && !!repositoryData,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 1, // Don't retry validation failures too much
  });
};

// Mutation hook to convert Melo points to CTSI
export const useConvertMeloPoints = () => {
  const { signMessages } = useMelodiousContext();
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();

  return useMutation({
    mutationFn: async ({
      walletAddress,
      meloPoints,
    }: {
      walletAddress: string;
      meloPoints: number;
    }) => {
      if (!signMessages || !activeAccount) {
        throw new Error(
          "Transaction service not available or wallet not connected"
        );
      }

      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const transactionData = {
          method: "convert_melo_to_ctsi",
          args: {
            walletAddress,
            meloPoints,
            timestamp,
          },
        };

        const response = await signMessages(transactionData);
        return response;
      } catch (error) {
        console.error("Error converting Melo points:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Successfully converted ${variables.meloPoints} Melo points to CTSI!`
      );

      // Immediate invalidation
      queryClient.invalidateQueries({
        queryKey: noticesKeys.lists(),
      });

      // Add a small delay to allow backend processing, then force refetch
      setTimeout(() => {
        // Force refetch notices query to refresh repository data immediately
        // Reset staleTime to 0 to force fresh data fetch
        queryClient.resetQueries({
          queryKey: noticesKeys.lists(),
        });
        queryClient.refetchQueries({
          queryKey: noticesKeys.lists(),
          type: "active",
        });

        // Invalidate and refetch related queries
        queryClient.invalidateQueries({
          queryKey: referralKeys.stats(variables.walletAddress),
        });
        queryClient.invalidateQueries({
          queryKey: referralKeys.transactions(variables.walletAddress),
        });

        // Also invalidate user data if you have user queries
        queryClient.invalidateQueries({
          queryKey: ["users", variables.walletAddress],
        });
      }, 3000); // 3 second delay to allow backend processing
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to convert Melo points";
      toast.error(errorMessage);
      console.error("Conversion error:", error);
    },
  });
};

// Hook to get current user's referral data (convenience hook)
export const useMyReferralData = () => {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;

  const statsQuery = useReferralStats(walletAddress);
  const transactionsQuery = useReferralTransactions(walletAddress);
  const conversionInfoQuery = useConversionInfo();

  return {
    stats: statsQuery.data,
    transactions: transactionsQuery.data,
    conversionInfo: conversionInfoQuery.data,
    isLoading:
      statsQuery.isLoading ||
      transactionsQuery.isLoading ||
      conversionInfoQuery.isLoading,
    isError:
      statsQuery.isError ||
      transactionsQuery.isError ||
      conversionInfoQuery.isError,
    error:
      statsQuery.error || transactionsQuery.error || conversionInfoQuery.error,
    refetch: () => {
      statsQuery.refetch();
      transactionsQuery.refetch();
      conversionInfoQuery.refetch();
    },
  };
};

// Query keys are already exported above
