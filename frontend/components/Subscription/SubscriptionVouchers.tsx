"use client";

import React, { useCallback, useState, useMemo } from "react";
import { ethers } from "ethers";
import { useRollups } from "@/cartesi/hooks/useRollups";
import { Voucher, useVouchers } from "@/cartesi/hooks/useVouchers";
import { executeVoucher } from "@/cartesi/Portals";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/queryClient";
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  FileSearch,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useVoucherExecutionStatus,
  voucherExecutionKeys,
} from "@/hooks/useVoucherExecutionStatus";
import { useSubscriptionStatus } from "@/hooks/useSubscription";

interface ISubscriptionVouchersProps {
  dappAddress: string;
}

export const SubscriptionVouchers: React.FC<ISubscriptionVouchersProps> = ({
  dappAddress,
}) => {
  const rollups = useRollups(dappAddress);
  const account = useActiveAccount();
  const { activeSubscription, isLoading } = useSubscriptionStatus();
  
  // Debug logging
  console.log("SubscriptionVouchers - activeSubscription:", activeSubscription);
  console.log("SubscriptionVouchers - isLoading:", isLoading);
  console.log("SubscriptionVouchers - account:", account?.address);
  const {
    loading,
    error,
    vouchers,
    refetch: refetchVouchers,
    client: apolloClient,
  } = useVouchers();

  const queryClient = useQueryClient();
  const [voucherToExecute, setVoucherToExecute] = useState<Voucher>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setVoucher = useCallback(
    async (voucher: any) => {
      if (rollups) {
        // Check execution status before setting the voucher
        try {
          voucher.executed = await rollups.dappContract.wasVoucherExecuted(
            ethers.BigNumber.from(voucher.input.index),
            ethers.BigNumber.from(voucher.index)
          );
        } catch (error) {
          console.log("Error checking voucher execution status:", error);
          voucher.executed = false;
        }
      }
      setVoucherToExecute(voucher);
    },
    [rollups]
  );

  const handleExecuteVoucher = async () => {
    if (!voucherToExecute || !rollups || !apolloClient) {
      toast.error("Missing required data for voucher execution");
      return;
    }

    // Check if voucher is already executed
    if (voucherToExecute.executed) {
      toast.error("Voucher has already been executed");
      return;
    }

    setIsExecuting(true);
    
    try {
      console.log("Executing voucher:", {
        voucherIndex: voucherToExecute.index,
        inputIndex: voucherToExecute.input?.index,
        destination: voucherToExecute.destination,
        payload: voucherToExecute.payload,
        hasProof: !!voucherToExecute.proof
      });
      
      const result = await executeVoucher(
        apolloClient,
        voucherToExecute,
        rollups
      );
      
      // Check if result indicates an error
       if (typeof result === 'object' && result !== null && 'message' in result && !(result as any).success) {
         const errorMessage = (result as any).message || 'Unknown error';
         console.error('Voucher execution failed:', result);
         toast.error(`Voucher execution failed: ${errorMessage}`);
         return;
       }
      // Show success message
      if (typeof result === 'object' && result !== null && (result as any).success && (result as any).message) {
        toast.success((result as any).message);
      } else if (typeof result === 'string') {
        toast.success(result);
      } else if (typeof result === 'object' && result !== null && 'message' in result) {
        toast.success((result as any).message);
      } else {
        toast.success('Voucher executed successfully!');
      }
      setVoucherToExecute(undefined);

      // Call backend to update subscription status after voucher execution
      console.log("Active subscription:", activeSubscription);
      console.log("Voucher execution result:", result);
      
      if (activeSubscription?.id) {
        try {
          // Get the most recent payment's paymentId or use voucher ID as fallback
          const paymentId =
            activeSubscription.payments?.[
              activeSubscription.payments.length - 1
            ]?.paymentId || voucherToExecute.id;

          // Extract transaction hash from successful result
          let transactionHash: string;
          if (typeof result === 'object' && result !== null && (result as any).success && (result as any).txHash) {
            transactionHash = (result as any).txHash;
          } else if (typeof result === 'string') {
            // Legacy string response - generate placeholder
            transactionHash = `voucher-${voucherToExecute.input.index}-${voucherToExecute.index}`;
          } else if (result && typeof result === 'object') {
            // Try to extract hash from various possible properties
            transactionHash = (result as any)?.hash || (result as any)?.transactionHash || 
              (result as any)?.txHash ||
              `voucher-${voucherToExecute.input.index}-${voucherToExecute.index}`;
          } else {
            transactionHash = `voucher-${voucherToExecute.input.index}-${voucherToExecute.index}`;
          }

          console.log("Calling backend with payload:", {
            subscriptionId: activeSubscription.id,
            paymentId: paymentId,
            transactionHash: transactionHash,
          });

          const response = await apiClient.post("/subscriptions/process-payment", {
            subscriptionId: activeSubscription.id,
            paymentId: paymentId,
            transactionHash: transactionHash,
          });
          console.log("Backend subscription status updated successfully:", response.data);
          toast.success("Subscription status updated!");
        } catch (error) {
          console.error("Failed to update backend subscription status:", error);
          toast.error("Failed to update subscription status");
        }
      } else {
        console.log("No active subscription found, skipping backend call");
        toast.error("No active subscription found");
      }

      // Invalidate and refetch voucher execution status
      queryClient.invalidateQueries({
        queryKey: voucherExecutionKeys.list(dappAddress, subscriptionVouchers),
      });
    } catch (error) {
      console.error("Error executing voucher:", error);
      toast.error("Failed to execute voucher");
    } finally {
      setIsExecuting(false);
    }
  };

  // Filter vouchers to show vault-related ones for the current user only
  const subscriptionVouchers = useMemo(() => {
    if (!account?.address || !vouchers) return [];

    return vouchers.filter((voucher: any) => {
      // First check if the voucher belongs to the current user
      const isUserVoucher =
        voucher.input?.msgSender?.toLowerCase() ===
        account.address.toLowerCase();

      // Then check if it's subscription-related
      const isSubscriptionRelated =
        voucher.payload.includes("Erc20 Transfer") ||
        voucher.payload.includes("vault") ||
        voucher.payload.includes("subscription") ||
        voucher.payload.includes("CTSI Transfer");

      return isUserVoucher && isSubscriptionRelated;
    });
  }, [vouchers, account?.address]);

  // Use TanStack Query to manage voucher execution status
  const {
    data: executionStatuses = {},
    isLoading: statusLoading,
    refetch: refetchStatuses,
  } = useVoucherExecutionStatus(dappAddress, subscriptionVouchers);

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Subscription Vouchers ({subscriptionVouchers?.length || 0})
        </h3>
        <button
          onClick={async () => {
            setIsRefreshing(true);
            try {
              await Promise.all([
                refetchVouchers({ requestPolicy: "network-only" }),
                refetchStatuses(),
              ]);
            } finally {
              setIsRefreshing(false);
            }
          }}
          disabled={isRefreshing}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "bg-zinc-800 hover:bg-zinc-700",
            "text-zinc-300 hover:text-white",
            "border border-zinc-700 hover:border-zinc-600",
            "transition-all duration-200",
            "flex items-center gap-2",
            isRefreshing && "cursor-not-allowed opacity-75"
          )}
        >
          <RefreshCw
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isRefreshing && "animate-spin"
            )}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {(loading || statusLoading) && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#950844]" />
          <span className="ml-2 text-zinc-400">
            {loading ? "Loading vouchers..." : "Checking execution status..."}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center p-8">
          <XCircle className="w-6 h-6 text-red-500" />
          <span className="ml-2 text-red-400">Error loading vouchers</span>
        </div>
      )}

      {!loading &&
        !statusLoading &&
        !error &&
        (!subscriptionVouchers || subscriptionVouchers.length === 0) && (
          <div className="flex items-center justify-center p-8">
            <FileSearch className="w-6 h-6 text-zinc-400" />
            <span className="ml-2 text-zinc-400">
              No subscription vouchers found
            </span>
          </div>
        )}

      {!loading &&
        !statusLoading &&
        !error &&
        subscriptionVouchers &&
        subscriptionVouchers.length > 0 && (
          <>
            {/* Selected Voucher Execution */}
            {voucherToExecute && (
              <div className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Selected Voucher
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-zinc-400">Payload:</span>
                    <p className="text-sm text-zinc-300 break-all mt-1">
                      {voucherToExecute.payload}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-400">Destination:</span>
                    <p className="text-sm text-zinc-300 break-all mt-1">
                      {voucherToExecute.destination}
                    </p>
                  </div>
                  <button
                    onClick={handleExecuteVoucher}
                    disabled={
                      isExecuting ||
                      executionStatuses[
                        `${voucherToExecute.input.index}-${voucherToExecute.index}`
                      ]
                    }
                    className={cn(
                      "px-6 py-3 rounded-lg text-sm font-medium",
                      "transition-all duration-200",
                      "flex items-center gap-2",
                      executionStatuses[
                        `${voucherToExecute.input.index}-${voucherToExecute.index}`
                      ]
                        ? "bg-green-600/20 text-green-400 cursor-not-allowed"
                        : isExecuting
                        ? "bg-[#950844]/50 text-white cursor-not-allowed"
                        : "bg-[#950844] hover:bg-[#7e0837] text-white"
                    )}
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Executing...
                      </>
                    ) : executionStatuses[
                        `${voucherToExecute.input.index}-${voucherToExecute.index}`
                      ] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Voucher Executed
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        Execute Voucher
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Vouchers List */}
            <div className="bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400">
                        User Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400">
                        Payload
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {!subscriptionVouchers ||
                    subscriptionVouchers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-8 text-center text-zinc-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileSearch className="w-8 h-8 text-zinc-600" />
                            <p>No subscription vouchers available</p>
                            <p className="text-sm text-zinc-600">
                              Complete a subscription to generate vouchers
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      subscriptionVouchers.map((voucher: any) => {
                        const voucherKey = `${voucher.input.index}-${voucher.index}`;
                        const isExecuted =
                          executionStatuses[voucherKey] || false;

                        return (
                          <tr
                            key={`${voucher.input.index}-${voucher.index}`}
                            className="hover:bg-zinc-800/50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setVoucher(voucher)}
                                disabled={isExecuted}
                                className={cn(
                                  "px-4 py-2 rounded-lg text-sm font-medium",
                                  "transition-all duration-200",
                                  "flex items-center gap-2",
                                  isExecuted
                                    ? "bg-green-600/20 text-green-400 cursor-not-allowed"
                                    : "bg-[#950844] hover:bg-[#7e0837] text-white"
                                )}
                              >
                                {isExecuted ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Executed
                                  </>
                                ) : (
                                  <>
                                    <FileSearch className="w-4 h-4" />
                                    Select
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-zinc-300 break-all font-mono">
                                {voucher.input.msgSender}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-zinc-300 break-all">
                                {voucher.payload}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </div>
  );
};
