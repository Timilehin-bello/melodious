import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useActiveAccount } from "thirdweb/react";
import { useRepositoryData, noticesKeys } from "./useNoticesQuery";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  readContract,
} from "thirdweb";
import CTSITokenABI from "@/configs/CTSITokenABI.json";
import MelodiousVaultABI from "@/configs/MelodiousVaultABI.json";
import { ethers } from "ethers";
import { client } from "@/lib/client";
import { networkChain } from "@/components/ConnectWallet";
import { useUserByWallet } from "./useUserByWallet";

// Helper function to get contract addresses from repository data
const getContractAddresses = (repositoryData: any) => {
  return {
    ctsiToken: repositoryData?.config?.cartesiTokenContractAddress,
    melodiousVault:
      repositoryData?.config?.vaultContractAddress ||
      process.env.NEXT_PUBLIC_MELODIOUS_VAULT_ADDRESS,
    inputBox:
      process.env.NEXT_PUBLIC_INPUTBOX_ADDRESS ||
      "0x59b22D57D4f067708AB0c00552767405926dc768",
    dappAddress:
      process.env.NEXT_PUBLIC_DAPP_ADDRESS ||
      "0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e",
  };
};

// Subscription types
export interface CartesiSubscription {
  id: number;
  listener: Listener;
  listenerId: number;
  startDate: string;
  endDate: string;
  paymentMethod: string;
  subscriptionLevel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Listener {
  id: number;
  subscriptionLevel: SubscriptionLevel;
  playlists: any;
  subscription: any;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionLevel {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
}

export interface SubscribeRequest {
  subscriptionLevel: string;
  amount: number;
}

// Query keys for Cartesi subscriptions
export const cartesiSubscriptionKeys = {
  all: ["cartesi-subscriptions"] as const,
  userSubscriptions: (walletAddress?: string) =>
    [...cartesiSubscriptionKeys.all, "user", walletAddress] as const,
  allSubscriptions: () => [...cartesiSubscriptionKeys.all, "all"] as const,
};

// Hook to get user's subscriptions from Cartesi notices
export const useCartesiUserSubscriptions = (walletAddress?: string) => {
  const { subscriptions, isLoading, error } = useRepositoryData();
  const { user, isLoading: userLoading } = useUserByWallet(walletAddress);
  return useQuery({
    queryKey: cartesiSubscriptionKeys.userSubscriptions(walletAddress),
    queryFn: () => {
      if (!walletAddress || !subscriptions || !user) return [];

      console.log(
        "useCartesiUserSubscriptions:",
        subscriptions,
        "---",
        user,
        walletAddress
      );

      // Filter subscriptions for the specific user
      const userSubscriptions = subscriptions.filter(
        (subscription: CartesiSubscription) => {
          console.log("useCartesiUserSubscriptions", user.id);
          // Match by wallet address through listener relationship
          return subscription.listener.userId === user.id;
        }
      );
      console.log(
        "useCartesiUserSubscriptions:",
        subscriptions,
        "===",
        userSubscriptions
      );

      return userSubscriptions;
    },
    enabled: !!walletAddress && !!subscriptions && !!user && !userLoading,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Hook to get all subscriptions from Cartesi notices
export const useCartesiAllSubscriptions = () => {
  const { subscriptions, isLoading, error } = useRepositoryData();

  return useQuery({
    queryKey: cartesiSubscriptionKeys.allSubscriptions(),
    queryFn: () => subscriptions || [],
    enabled: !!subscriptions,
    staleTime: 30 * 1000,
  });
};

// Hook to create a subscription via Cartesi
export const useCartesiSubscribe = () => {
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { repositoryData } = useRepositoryData();

  return useMutation({
    mutationFn: async (request: SubscribeRequest) => {
      if (!activeAccount || !repositoryData) {
        throw new Error("Wallet or repository data not available");
      }

      // Get contract addresses from repository config
      const addresses = getContractAddresses(repositoryData);
      if (!addresses.ctsiToken || !addresses.melodiousVault) {
        throw new Error("Required contract addresses not found in config");
      }

      try {
        // Create contract instances
        const ctsiContract = getContract({
          client,
          chain: networkChain,
          address: addresses.ctsiToken,
          abi: CTSITokenABI as any,
        });

        const vaultContract = getContract({
          client,
          chain: networkChain,
          address: addresses.melodiousVault,
          abi: MelodiousVaultABI as any,
        });

        console.log("Creating subscription via MelodiousVault for:", {
          walletAddress: activeAccount.address,
          subscriptionLevel: request.subscriptionLevel,
          amount: request.amount,
        });

        // Get subscription price from contract
        const subscriptionPrice = await readContract({
          contract: vaultContract,
          method: "subscriptionPrice",
        });

        console.log("Subscription price:", subscriptionPrice);

        // Check user's CTSI balance
        const userBalance = await readContract({
          contract: ctsiContract,
          method: "balanceOf",
          params: [activeAccount.address],
        });

        if (userBalance < subscriptionPrice) {
          throw new Error("Insufficient CTSI balance for subscription");
        }

        // Check current allowance
        const currentAllowance = await readContract({
          contract: ctsiContract,
          method: "allowance",
          params: [activeAccount.address, addresses.melodiousVault],
        });

        // If allowance is insufficient, approve the vault contract
        if (currentAllowance < subscriptionPrice) {
          const approveTransaction = prepareContractCall({
            contract: ctsiContract,
            method: "approve",
            params: [addresses.melodiousVault, subscriptionPrice],
          });

          const approveResult = await sendTransaction({
            transaction: approveTransaction,
            account: activeAccount,
          });

          console.log(
            "CTSI approval transaction:",
            approveResult.transactionHash
          );
        }

        // Construct JSON payload for Cartesi backend
        const payload = JSON.stringify({
          method: "subscribe",
          args: {
            walletAddress: activeAccount.address,
            subscriptionLevel: request.subscriptionLevel,
            amount: request.amount,
            timestamp: Math.floor(Date.now() / 1000),
            signer: activeAccount.address,
            createdAt: Math.floor(Date.now() / 1000),
          },
        });

        // Convert payload to bytes (hex format)
        const payloadBytes = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(payload)
        );

        // Call the subscribe function on the vault contract
        const subscribeTransaction = prepareContractCall({
          contract: vaultContract,
          method: "subscribe",
          params: [payloadBytes],
        });

        const result = await sendTransaction({
          transaction: subscribeTransaction,
          account: activeAccount,
        });

        console.log("Subscription transaction:", result.transactionHash);
        return result;
      } catch (error) {
        console.error("Error creating subscription:", error);
        throw error;
      }
    },
    onMutate: async (request: SubscribeRequest) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: cartesiSubscriptionKeys.userSubscriptions(
          activeAccount?.address
        ),
      });

      // Snapshot the previous value for rollback on error
      const previousSubscriptions = queryClient.getQueryData(
        cartesiSubscriptionKeys.userSubscriptions(activeAccount?.address)
      );

      // Don't apply optimistic updates here - wait for success
      // Just return the context for potential rollback
      return { previousSubscriptions };
    },
    onError: (error, request, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(
          cartesiSubscriptionKeys.userSubscriptions(activeAccount?.address),
          context.previousSubscriptions
        );
      }

      // Also reset the optimistic status update
      queryClient.invalidateQueries({
        queryKey: [
          ...cartesiSubscriptionKeys.userSubscriptions(activeAccount?.address),
          "status",
        ],
      });

      console.error("Subscription creation failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create subscription. Please try again."
      );
    },
    onSuccess: (data, request) => {
      toast.success("Subscription created successfully!");
      
      // Apply optimistic updates only on success
      const currentSubscriptions = queryClient.getQueryData(
        cartesiSubscriptionKeys.userSubscriptions(activeAccount?.address)
      ) as CartesiSubscription[] || [];

      // Create optimistic subscription data
      const optimisticSubscription: CartesiSubscription = {
        id: Date.now(), // Temporary ID
        listener: {} as Listener, // Placeholder
        listenerId: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: "CTSI",
        subscriptionLevel: request.subscriptionLevel.toUpperCase(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update the user subscriptions data
      const updatedSubscriptions = [...currentSubscriptions, optimisticSubscription];
      
      queryClient.setQueryData(
        cartesiSubscriptionKeys.userSubscriptions(activeAccount?.address),
        updatedSubscriptions
      );

      // Also update the status query directly
      queryClient.setQueryData(
        [...cartesiSubscriptionKeys.userSubscriptions(activeAccount?.address), "status"],
        {
          hasActiveSubscription: true,
          currentSubscription: optimisticSubscription,
          subscriptionLevel: request.subscriptionLevel.toUpperCase(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      );
      
      // Schedule a delayed refetch to get real data from backend
      setTimeout(() => {
        // Only invalidate the specific user subscription queries
        queryClient.invalidateQueries({
          queryKey: cartesiSubscriptionKeys.userSubscriptions(
            activeAccount?.address
          ),
        });
        
        // Also invalidate the status query
        queryClient.invalidateQueries({
          queryKey: [...cartesiSubscriptionKeys.userSubscriptions(activeAccount?.address), "status"],
        });
        
        // Only refetch notices once, not twice
        queryClient.invalidateQueries({
          queryKey: noticesKeys.all,
        });
      }, 10000); // Wait 3 seconds for backend processing
    },
  });
};

// Hook to get subscription price from MelodiousVault contract
export const useSubscriptionPrice = () => {
  const { repositoryData } = useRepositoryData();

  return useQuery({
    queryKey: ["subscription-price"],
    queryFn: async () => {
      const addresses = getContractAddresses(repositoryData);
      if (!addresses.melodiousVault) {
        throw new Error("MelodiousVault contract address not found");
      }

      const vaultContract = getContract({
        client,
        chain: networkChain,
        address: addresses.melodiousVault,
        abi: MelodiousVaultABI as any,
      });

      const price = await readContract({
        contract: vaultContract,
        method: "subscriptionPrice",
      });

      return ethers.utils.formatEther(price);
    },
    enabled: !!repositoryData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get current subscription status for a user
export const useCartesiSubscriptionStatus = (walletAddress?: string) => {
  const { data: userSubscriptions, isLoading: subscriptionsLoading } =
    useCartesiUserSubscriptions(walletAddress);

  console.log("userSubscriptions 310: ", userSubscriptions);

  return useQuery({
    queryKey: [
      ...cartesiSubscriptionKeys.userSubscriptions(walletAddress),
      "status",
    ],
    queryFn: () => {
      console.log("userSubscriptions 326: ", userSubscriptions);
      if (!userSubscriptions || userSubscriptions.length === 0) {
        return {
          hasActiveSubscription: false,
          currentSubscription: null,
          subscriptionLevel: null,
          expiresAt: null,
        };
      }

      // Find the most recent active subscription
      const activeSubscription = userSubscriptions
        .filter((sub: CartesiSubscription) => sub.isActive)
        .sort(
          (a: CartesiSubscription, b: CartesiSubscription) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      if (!activeSubscription) {
        return {
          hasActiveSubscription: false,
          currentSubscription: null,
          subscriptionLevel: null,
          expiresAt: null,
        };
      }

      // Check if subscription is still valid (not expired)
      const now = new Date();
      const expiresAt = new Date(activeSubscription.endDate);
      const isValid = now < expiresAt;

      return {
        hasActiveSubscription: isValid,
        currentSubscription: activeSubscription,
        subscriptionLevel: activeSubscription.subscriptionLevel,
        expiresAt: expiresAt.toISOString(),
      };
    },
    enabled: !!userSubscriptions && !subscriptionsLoading,
    staleTime: 5000, // Consider data fresh for 5 seconds (more efficient)
    refetchInterval: 30000, // Refetch every 30 seconds (less frequent)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
