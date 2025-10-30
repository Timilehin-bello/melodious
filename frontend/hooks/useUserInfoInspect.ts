import { useQuery } from "@tanstack/react-query";
import { useInspectCall } from "@/cartesi/hooks/useInspectCall";

interface UserInfo {
  id: string;
  walletAddress: string;
  name: string;
  email: string;
  cartesiTokenBalance: number;
  artist: {
    id: string;
    name: string;
    totalListeningTime: number;
  };
}

// Query keys for user info
export const userInfoInspectKeys = {
  all: ["userInfoInspect"] as const,
  byAddress: (address: string) => [...userInfoInspectKeys.all, address] as const,
};

export const useUserInfoInspect = (walletAddress?: string) => {
  const { inspectCall } = useInspectCall();

  return useQuery({
    queryKey: userInfoInspectKeys.byAddress(walletAddress || ""),
    queryFn: async (): Promise<UserInfo | null> => {
      if (!walletAddress) {
        return null;
      }
      
      try {
        const userInfo = await inspectCall(`get_user_info/${walletAddress}`);
        return userInfo as UserInfo;
      } catch (error) {
        console.error("Error fetching user info:", error);
        throw error;
      }
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};