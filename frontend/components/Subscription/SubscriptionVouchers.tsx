"use client";

import React, { useCallback, useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { useRollups } from "@/cartesi/hooks/useRollups";
import { Voucher, useVouchers } from "@/cartesi/hooks/useVouchers";
import { executeVoucher } from "@/cartesi/Portals";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "react-hot-toast";
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  FileSearch,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ISubscriptionVouchersProps {
  dappAddress: string;
}

export const SubscriptionVouchers: React.FC<ISubscriptionVouchersProps> = ({
  dappAddress,
}) => {
  const rollups = useRollups(dappAddress);
  const account = useActiveAccount();
  const {
    loading,
    error,
    vouchers,
    refetch: refetchVouchers,
    client: apolloClient,
  } = useVouchers();

  const [voucherToExecute, setVoucherToExecute] = useState<Voucher>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [executionStatuses, setExecutionStatuses] = useState<{
    [key: string]: boolean;
  }>({});

  const setVoucher = useCallback(
    async (voucher: any) => {
      if (rollups) {
        voucher.executed = await rollups.dappContract.wasVoucherExecuted(
          ethers.BigNumber.from(voucher.input.index),
          ethers.BigNumber.from(voucher.index)
        );
        // Update execution status in state
        setExecutionStatuses((prev) => ({
          ...prev,
          [`${voucher.input.index}-${voucher.index}`]: voucher.executed,
        }));
      }
      setVoucherToExecute(voucher);
    },
    [rollups]
  );

  // Check execution status for all vouchers
  const checkVoucherExecutionStatus = useCallback(
    async (vouchersList: any[]) => {
      if (!rollups) return {};

      const statuses: { [key: string]: boolean } = {};

      for (const voucher of vouchersList) {
        try {
          const executed = await rollups.dappContract.wasVoucherExecuted(
            ethers.BigNumber.from(voucher.input.index),
            ethers.BigNumber.from(voucher.index)
          );
          statuses[`${voucher.input.index}-${voucher.index}`] = executed;
        } catch (error) {
          console.log("Error checking voucher execution status:", error);
          statuses[`${voucher.input.index}-${voucher.index}`] = false;
        }
      }

      setExecutionStatuses(statuses);
      return statuses;
    },
    [rollups]
  );

  const handleExecuteVoucher = async () => {
    if (!voucherToExecute || !rollups || !apolloClient) {
      toast.error("Missing required data for voucher execution");
      return;
    }

    setIsExecuting(true);
    try {
      await executeVoucher(apolloClient, voucherToExecute, rollups);
      toast.success("Voucher executed successfully!");
      setVoucherToExecute(undefined);
      // Note: Manual refresh required - no automatic refetch
    } catch (error) {
      console.error("Error executing voucher:", error);
      toast.error("Failed to execute voucher");
    } finally {
      setIsExecuting(false);
    }
  };

  // Filter vouchers to show vault-related ones (ERC20 transfers to vault or subscription-related)
  const subscriptionVouchers = vouchers?.filter((voucher: any) => {
    // Show vouchers that are ERC20 transfers (vault deposits) or contain subscription-related keywords
    return (
      voucher.payload.includes("Erc20 Transfer") ||
      voucher.payload.includes("vault") ||
      voucher.payload.includes("subscription") ||
      voucher.payload.includes("CTSI Transfer")
    );
  });

  // Check execution status when vouchers change
  useEffect(() => {
    if (subscriptionVouchers && subscriptionVouchers.length > 0) {
      checkVoucherExecutionStatus(subscriptionVouchers);
    }
  }, [subscriptionVouchers, checkVoucherExecutionStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#950844]" />
        <span className="ml-2 text-zinc-400">Loading vouchers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <XCircle className="w-6 h-6 text-red-500" />
        <span className="ml-2 text-red-400">Error loading vouchers</span>
      </div>
    );
  }

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
              await refetchVouchers({ requestPolicy: "network-only" });
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
              disabled={isExecuting || voucherToExecute.executed}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-medium",
                "transition-all duration-200",
                "flex items-center gap-2",
                voucherToExecute.executed
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
              ) : voucherToExecute.executed ? (
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
              {!subscriptionVouchers || subscriptionVouchers.length === 0 ? (
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
                  const isExecuted = executionStatuses[voucherKey] || false;

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
    </div>
  );
};
