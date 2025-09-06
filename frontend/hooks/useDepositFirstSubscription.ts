import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import { depositErc20ToVault, executeVoucher } from "@/cartesi/Portals";
import { useVouchers } from "@/cartesi/hooks/useVouchers";
import { apiClient } from "@/lib/queryClient";
import { subscriptionKeys } from "./useSubscription";
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  PaymentMethod,
  SubscriptionStatus,
} from "@/types/subscription";

// Enhanced subscription request with deposit workflow
export interface DepositFirstSubscriptionRequest {
  planType: string;
  planId: number;
  amount: number;
  currency: string;
  tokenAddress: string;
  dappAddress: string;
  autoRenew?: boolean;
}

// Workflow status tracking
export enum DepositWorkflowStatus {
  IDLE = "IDLE",
  DEPOSITING = "DEPOSITING",
  DEPOSIT_COMPLETED = "DEPOSIT_COMPLETED",
  CREATING_SUBSCRIPTION = "CREATING_SUBSCRIPTION",
  SUBSCRIPTION_CREATED = "SUBSCRIPTION_CREATED",
  EXECUTING_VOUCHER = "EXECUTING_VOUCHER",
  PROCESSING_PAYMENT = "PROCESSING_PAYMENT",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// Workflow state interface
export interface DepositWorkflowState {
  status: DepositWorkflowStatus;
  currentStep: string;
  depositTxHash?: string;
  subscriptionId?: number;
  voucherId?: string;
  error?: string;
  progress: number;
}

// Custom hook for deposit-first subscription workflow
export function useDepositFirstSubscription() {
  const queryClient = useQueryClient();
  const {
    vouchers,
    refetch: refetchVouchers,
    client: apolloClient,
  } = useVouchers();

  return useMutation({
    mutationFn: async ({
      request,
      rollups,
      signer,
      onStatusChange,
    }: {
      request: DepositFirstSubscriptionRequest;
      rollups: any;
      signer: ethers.Signer;
      onStatusChange?: (state: DepositWorkflowState) => void;
    }): Promise<DepositWorkflowState> => {
      let currentState: DepositWorkflowState = {
        status: DepositWorkflowStatus.IDLE,
        currentStep: "Initializing deposit workflow",
        progress: 0,
      };

      const updateState = (updates: Partial<DepositWorkflowState>) => {
        currentState = { ...currentState, ...updates };
        onStatusChange?.(currentState);
      };

      try {
        // Step 1: Validate inputs
        if (!rollups || !signer) {
          throw new Error("Missing required dependencies: rollups or signer");
        }

        if (!request.tokenAddress || !request.dappAddress) {
          throw new Error("Missing token or dapp address");
        }

        if (request.amount <= 0) {
          throw new Error("Invalid amount: must be greater than 0");
        }

        // Step 2: Deposit funds to vault
        updateState({
          status: DepositWorkflowStatus.DEPOSITING,
          currentStep: "Waiting for deposit",
          progress: 20,
        });

        const depositResult = await depositErc20ToVault(
          rollups,
          signer,
          request.tokenAddress,
          request.amount,
          request.dappAddress
        );

        if (
          !depositResult ||
          !depositResult.depositReceipt ||
          !depositResult.inputReceipt
        ) {
          throw new Error("Vault deposit failed: Invalid deposit result");
        }

        const depositTxHash = depositResult.depositReceipt.transactionHash;
        updateState({
          status: DepositWorkflowStatus.DEPOSIT_COMPLETED,
          currentStep:
            "Deposit completed successfully! Please execute the voucher to activate your subscription.",
          depositTxHash,
          progress: 40,
        });

        // Step 3: Create subscription record
        updateState({
          status: DepositWorkflowStatus.CREATING_SUBSCRIPTION,
          currentStep: "Creating subscription record",
          progress: 60,
        });

        const subscriptionRequest: CreateSubscriptionRequest = {
          planType: request.planType,
          paymentMethod: PaymentMethod.CRYPTO,
          paymentId: depositTxHash,
          autoRenew: request.autoRenew ?? true,
        };

        const subscriptionResponse =
          await apiClient.post<CreateSubscriptionResponse>(
            "/subscriptions",
            subscriptionRequest
          );

        if (!subscriptionResponse.data?.data?.id) {
          throw new Error("Failed to create subscription record");
        }

        const subscriptionId = subscriptionResponse.data.data.id;
        updateState({
          status: DepositWorkflowStatus.SUBSCRIPTION_CREATED,
          currentStep: "Subscription record created",
          subscriptionId,
          progress: 80,
        });

        // Step 4: Wait for voucher and execute it
        updateState({
          status: DepositWorkflowStatus.EXECUTING_VOUCHER,
          currentStep:
            "Subscription created successfully. Voucher execution pending.",
          progress: 90,
        });

        // Refetch vouchers to get the latest ones
        await refetchVouchers();

        // Find the relevant voucher (this might need adjustment based on your voucher structure)
        const relevantVoucher = vouchers?.find((voucher: any) => {
          // You might need to adjust this logic based on how vouchers are structured
          // and how they relate to the subscription
          return voucher.payload && voucher.payload.includes(request.planType);
        });

        if (!relevantVoucher) {
          // If no voucher found immediately, we'll mark as completed but note that voucher execution is pending
          updateState({
            status: DepositWorkflowStatus.COMPLETED,
            currentStep:
              "Subscription created successfully. Voucher execution pending.",
            progress: 100,
          });
          return currentState;
        }

        // Execute the voucher
        if (!apolloClient) {
          throw new Error("Apollo client not available for voucher execution");
        }

        const voucherResult = await executeVoucher(
          apolloClient,
          relevantVoucher,
          rollups
        );

        if (
          !voucherResult ||
          (typeof voucherResult === "string" &&
            !voucherResult.includes("successfully"))
        ) {
          throw new Error("Voucher execution failed");
        }

        // Step 5: Process payment to activate subscription
        updateState({
          status: DepositWorkflowStatus.PROCESSING_PAYMENT,
          currentStep: "Activating subscription...",
          voucherId: relevantVoucher.id,
          progress: 90,
        });

        // Call process-payment API to activate the subscription
        const processPaymentResponse = await apiClient.post(
          "/subscriptions/process-payment",
          {
            subscriptionId: currentState.subscriptionId,
            paymentId: currentState.depositTxHash,
            transactionHash: voucherResult,
          }
        );

        // Step 6: Verify subscription activation with backend
        updateState({
          status: DepositWorkflowStatus.PROCESSING_PAYMENT,
          currentStep: "Verifying subscription activation...",
          voucherId: relevantVoucher.id,
          progress: 95,
        });

        // Get updated subscription status from backend
        const subscriptionStatusResponse = await apiClient.get(
          `/subscriptions/${currentState.subscriptionId}`
        );

        const subscription = subscriptionStatusResponse.data?.data;
        if (!subscription || subscription.status !== "ACTIVE") {
          throw new Error("Subscription activation not confirmed by backend");
        }

        // Step 7: Workflow completed successfully with backend confirmation
        updateState({
          status: DepositWorkflowStatus.COMPLETED,
          currentStep: "Subscription activated successfully",
          voucherId: relevantVoucher.id,
          progress: 100,
        });

        return currentState;
      } catch (error: any) {
        console.error("Deposit-first subscription workflow error:", error);

        const errorMessage = getErrorMessage(error);
        updateState({
          status: DepositWorkflowStatus.FAILED,
          currentStep: "Workflow failed",
          error: errorMessage,
          progress: 0,
        });

        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });

      if (data.subscriptionId) {
        queryClient.invalidateQueries({
          queryKey: subscriptionKeys.detail(data.subscriptionId),
        });
      }

      if (data.status === DepositWorkflowStatus.COMPLETED) {
        toast.success(
          "Subscription activated successfully! You can now enjoy your premium features.",
          { duration: 5000 }
        );
      } else {
        toast.success(
          "Subscription created successfully! Please execute the voucher to activate your plan.",
          { duration: 5000 }
        );
      }
    },
    onError: (error: any) => {
      console.error("Deposit-first subscription failed:", error);

      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Helper function to extract user-friendly error messages
function getErrorMessage(error: any): string {
  if (error?.message) {
    // Handle specific error types
    if (error.message.includes("Insufficient token balance")) {
      return "Insufficient CTSI token balance. Please add more tokens to your wallet.";
    } else if (error.message.includes("User rejected")) {
      return "Transaction was cancelled. Please try again.";
    } else if (error.message.includes("Transaction failed")) {
      return "Transaction failed. Please check your wallet and try again.";
    } else if (error.message.includes("Invalid parameters")) {
      return "Invalid subscription parameters. Please refresh and try again.";
    } else if (error.message.includes("Network error")) {
      return "Network error. Please check your connection and try again.";
    } else if (error.message.includes("Vault deposit failed")) {
      return "Failed to deposit funds to vault. Please try again.";
    } else if (error.message.includes("Failed to create subscription")) {
      return "Failed to create subscription record. Please contact support.";
    } else if (error.message.includes("Voucher execution failed")) {
      return "Failed to execute voucher. Please try executing it manually.";
    }

    return error.message;
  }

  return "An unexpected error occurred during subscription process.";
}

// Hook for manual voucher execution (fallback)
export function useManualVoucherExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      voucher,
      rollups,
      apolloClient,
      subscriptionId,
      amount,
      currency = "CTSI",
      depositTxHash,
    }: {
      voucher: any;
      rollups: any;
      apolloClient: any;
      subscriptionId?: number;
      amount?: number;
      currency?: string;
      depositTxHash?: string;
    }) => {
      if (!rollups || !apolloClient) {
        throw new Error("Missing required dependencies for voucher execution");
      }

      const result = await executeVoucher(apolloClient, voucher, rollups);

      if (
        !result ||
        (typeof result === "string" && !result.includes("successfully"))
      ) {
        throw new Error("Voucher execution failed");
      }

      // If subscription details are provided, call process-payment API
      if (subscriptionId && depositTxHash) {
        await apiClient.post("/subscriptions/process-payment", {
          subscriptionId,
          paymentId: depositTxHash,
          transactionHash: result,
        });

        // Verify subscription activation with backend
        const subscriptionStatusResponse = await apiClient.get(
          `/subscriptions/${subscriptionId}`
        );

        const subscription = subscriptionStatusResponse.data?.data;
        if (!subscription || subscription.status !== "ACTIVE") {
          throw new Error("Subscription activation not confirmed by backend");
        }
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate subscriptions to refetch updated status
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });

      toast.success(
        "Subscription activated successfully! You can now enjoy your premium features.",
        { duration: 5000 }
      );
    },
    onError: (error: any) => {
      console.error("Manual voucher execution failed:", error);

      const errorMessage = getErrorMessage(error);
      toast.error(`Voucher execution failed: ${errorMessage}`, {
        duration: 5000,
      });
    },
  });
}
