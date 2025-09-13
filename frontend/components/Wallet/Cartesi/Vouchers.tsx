"use client";

import { ethers } from "ethers";
import React, { useCallback, useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface IVoucherProps {
  dappAddress: string;
}

export const Vouchers: React.FC<IVoucherProps> = ({ dappAddress }) => {
  const { loading, error, vouchers, refetch, client } = useVouchers();
  const [voucherToExecute, setVoucherToExecute] = useState<any>();
  const [isExecuting, setIsExecuting] = useState(false);
  const checkedVouchersRef = useRef<Set<string>>(new Set());
  const rollups = useRollups(dappAddress);
  const account = useActiveAccount();

  const getProof = async (voucher: Voucher) => {
    setVoucher(voucher);
    refetch({ requestPolicy: "network-only" });
  };

  // This will be defined after the TanStack Query

  // Check execution status for all vouchers - optimized for TanStack Query
  const checkVoucherExecutionStatus = useCallback(
    async (vouchersList: any[]) => {
      if (!rollups) return {};

      const statuses: { [key: string]: boolean } = {};

      for (const voucher of vouchersList) {
        const voucherKey = `${voucher.input.index}-${voucher.index}`;
        try {
          const executed = await rollups.dappContract.wasVoucherExecuted(
            ethers.BigNumber.from(voucher.input.index),
            ethers.BigNumber.from(voucher.index)
          );
          statuses[voucherKey] = executed;
        } catch (error) {
          console.log("Error checking voucher execution status:", error);
          statuses[voucherKey] = false;
        }
      }

      return statuses;
    },
    [rollups]
  );

  // Use vouchers directly from useVouchers hook (memoized to prevent unnecessary re-renders)
  const vouchersList = useMemo(() => {
    return vouchers || [];
  }, [vouchers]);

  // Use TanStack Query to manage voucher execution status
  const { data: executionStatusesQuery, refetch: refetchExecutionStatuses } =
    useQuery({
      queryKey: [
        "voucherExecutionStatuses",
        vouchersList?.map((v) => `${v.input.index}-${v.index}`).join(","),
      ],
      queryFn: async () => {
        if (!rollups || !vouchersList || vouchersList.length === 0) return {};
        return await checkVoucherExecutionStatus(vouchersList);
      },
      enabled: !!rollups && !!vouchersList && vouchersList.length > 0,
      staleTime: 30000, // Consider data fresh for 30 seconds
      refetchOnWindowFocus: false,
    });

  // Trigger GraphQL refetch when needed
  const handleRefresh = useCallback(() => {
    refetch({ requestPolicy: "network-only" });
    refetchExecutionStatuses();
  }, [refetch, refetchExecutionStatuses]);

  // Set voucher for execution with TanStack Query integration
  const setVoucher = useCallback(
    async (voucher: any) => {
      const voucherKey = `${voucher.input.index}-${voucher.index}`;

      // Check if we already have the execution status from TanStack Query
      if (
        executionStatusesQuery &&
        executionStatusesQuery[voucherKey] !== undefined
      ) {
        voucher.executed = executionStatusesQuery[voucherKey];
      } else if (rollups) {
        // Fallback: check directly if not in cache
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
    [rollups, executionStatusesQuery]
  );

  // Filter vouchers to show only those belonging to the current user
  const userVouchers = useMemo(() => {
    if (!account?.address || !vouchersList) return [];

    return vouchersList.filter((voucher: any) => {
      // Check if the voucher's input msgSender matches the current user's address
      return (
        voucher.input?.msgSender?.toLowerCase() ===
        account.address.toLowerCase()
      );
    });
  }, [vouchersList, account?.address]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Vouchers ({userVouchers?.length || 0})
        </h3>
        <button
          onClick={handleRefresh}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "bg-zinc-800 hover:bg-zinc-700",
            "text-zinc-300 hover:text-white",
            "transition-all duration-200",
            "flex items-center gap-2"
          )}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading vouchers...
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-8 text-red-400">
          <XCircle className="w-5 h-5 mr-2" />
          {error.message}
        </div>
      )}

      {!loading && !error && (!vouchersList.length || !userVouchers.length) && (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          <FileSearch className="w-5 h-5 mr-2" />
          No vouchers found
        </div>
      )}

      {!loading && !error && userVouchers.length > 0 && (
        <>
          {/* Selected Voucher */}
          {voucherToExecute && (
            <div className="bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/50">
                <h4 className="text-sm font-medium text-zinc-400">
                  Selected Voucher
                </h4>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500">Input Index</p>
                    <p className="text-sm text-white font-mono">
                      {voucherToExecute.input.index}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500">Voucher Index</p>
                    <p className="text-sm text-white font-mono">
                      {voucherToExecute.index}
                    </p>
                  </div>
                </div>
                <button
                  disabled={voucherToExecute.executed || isExecuting}
                  onClick={async () => {
                    setIsExecuting(true);
                    try {
                      const res = await executeVoucher(
                        client,
                        voucherToExecute,
                        rollups!
                      );
                      if (res) {
                        toast.success("Voucher executed successfully");
                        // Update the current voucher's executed status
                        setVoucherToExecute((prev: any) => ({
                          ...prev,
                          executed: true,
                        }));
                        // Refresh both GraphQL data and execution statuses
                        handleRefresh();
                      } else {
                        toast.error("Failed to execute voucher");
                      }
                    } catch (error) {
                      toast.error("Error executing voucher");
                    } finally {
                      setIsExecuting(false);
                    }
                  }}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg font-medium",
                    "flex items-center justify-center gap-2",
                    "transition-all duration-200",
                    voucherToExecute.executed
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white"
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
                  {userVouchers && userVouchers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-center text-zinc-500"
                      >
                        No vouchers available
                      </td>
                    </tr>
                  ) : (
                    userVouchers?.map((n: any) => {
                      const voucherKey = `${n.input.index}-${n.index}`;
                      const isExecuted =
                        executionStatusesQuery?.[voucherKey] || false;

                      return (
                        <tr
                          key={`${n.input.index}-${n.index}`}
                          className="hover:bg-zinc-800/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => getProof(n)}
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
                                  Get Proof
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-zinc-300 font-mono break-all">
                              {n.input.msgSender}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-zinc-300 break-all">
                              {n.payload}
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
