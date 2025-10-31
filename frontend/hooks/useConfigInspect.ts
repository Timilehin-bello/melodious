import { useQuery } from "@tanstack/react-query";
import { useInspectCall } from "@/cartesi/hooks/useInspectCall";
import { useActiveWalletChain } from "thirdweb/react";

// MelodiousConfig interface - keeping consistent with existing definition
export interface MelodiousConfig {
  adminWalletAddresses: string[];
  cartesiTokenContractAddress: `0x${string}`;
  vaultContractAddress: `0x${string}`;
  vaultBalance: number;
  feeBalance: number;
  artistPercentage: number;
  poolPercentage: number;
  feePercentage: number;
  serverAddress: string;
  relayerAddress: string;
  dappContractAddress: string;
  melodiousNftAddress: string;
  trackNftContractAddress: `0x${string}`;
  artistTokenContractAddress: `0x${string}`;
  lastVaultBalanceDistributed: number;
  referralPoints: number;
  conversionRate: number;
  minConversion: number;
  maxDailyConversion: number;
}

// Query keys for config inspect calls
export const configInspectKeys = {
  all: ["config-inspect"] as const,
  config: () => [...configInspectKeys.all, "config"] as const,
};

// TanStack Query hook for fetching config via inspect calls
export const useConfigInspect = () => {
  const { inspectCall } = useInspectCall();
  const chain = useActiveWalletChain();

  return useQuery({
    queryKey: configInspectKeys.config(),
    queryFn: async (): Promise<MelodiousConfig | null> => {
      try {
        if (!chain) {
          throw new Error("No active wallet chain");
        }

        const result = await inspectCall("get_config");
        
        // The inspectCall returns the decoded response directly
        if (result && typeof result === 'object') {
          return result as MelodiousConfig;
        }
        
        return null;
      } catch (error) {
        console.error("Error fetching config via inspect:", error);
        throw error;
      }
    },
    enabled: !!chain, // Only run when we have an active chain
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Convenience hook that matches the existing API pattern
export const useRepositoryConfigInspect = () => {
  const query = useConfigInspect();
  
  return {
    config: query.data ?? null, // Convert undefined to null for consistency
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};