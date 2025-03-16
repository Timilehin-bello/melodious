"use client";

import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
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
  const { loading, error, data, vouchers, refetch, client } = useVouchers();
  const [voucherToExecute, setVoucherToExecute] = useState<any>();
  const [isExecuting, setIsExecuting] = useState(false);
  const rollups = useRollups(dappAddress);
  const account = useActiveAccount();

  const getProof = async (voucher: Voucher) => {
    setVoucher(voucher);
    refetch({ requestPolicy: "network-only" });
  };

  const setVoucher = useCallback(
    async (voucher: any) => {
      if (rollups) {
        voucher.executed = await rollups.dappContract.wasVoucherExecuted(
          ethers.BigNumber.from(voucher.input.index),
          ethers.BigNumber.from(voucher.index)
        );
      }
      setVoucherToExecute(voucher);
    },
    [rollups]
  );

  useEffect(() => {
    refetch({ requestPolicy: "network-only" });
  }, [refetch, vouchers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading vouchers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-400">
        <XCircle className="w-5 h-5 mr-2" />
        {error.message}
      </div>
    );
  }

  if (!data || !data.vouchers) {
    return (
      <div className="flex items-center justify-center py-8 text-zinc-400">
        No vouchers available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Vouchers</h3>
        <button
          onClick={() => refetch({ requestPolicy: "network-only" })}
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
                  Payload
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {vouchers && vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-4 text-center text-zinc-500"
                  >
                    No vouchers available
                  </td>
                </tr>
              ) : (
                vouchers?.map((n: any) => (
                  <tr
                    key={`${n.input.index}-${n.index}`}
                    style={{
                      display: n.payload.includes(
                        account?.address ||
                          localStorage.getItem("walletAddress")
                      )
                        ? "table-row"
                        : "none",
                    }}
                    className="hover:bg-zinc-800/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => getProof(n)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium",
                          "bg-[#950844] hover:bg-[#7e0837]",
                          "text-white transition-all duration-200",
                          "flex items-center gap-2"
                        )}
                      >
                        <FileSearch className="w-4 h-4" />
                        Get Proof
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300 break-all">
                        {n.payload}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
