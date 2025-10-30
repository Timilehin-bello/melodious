"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { BalanceProps } from "@/types";
import {
  Coins,
  Wallet,
  Image as ImageIcon,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Balance: React.FC<BalanceProps> = ({
  account,
  transactionStatus,
  inspectCall,
  reports,
  decodedReports,
  userDetails,
  fetchData,
  refetchUserDetails,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    if (account?.address) {
      setIsLoading(true);
      try {
        await inspectCall(`balance/${account.address}`);

        // Also refetch user details to update CTSI balance
        if (refetchUserDetails) {
          refetchUserDetails();
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatERC20Value = (value: string): string => {
    try {
      const [, amount] = value.split(",");
      const numericAmount = Number(amount);
      if (isNaN(numericAmount)) return "0";
      return (numericAmount / 10 ** 18).toString();
    } catch (error) {
      return "0";
    }
  };

  const balanceCards = [
    {
      title: "Ether",
      icon: <Wallet className="w-5 h-5" />,
      value: decodedReports?.ether
        ? ethers.utils.formatEther(decodedReports.ether)
        : "0",
    },
    {
      title: "ERC-20",
      icon: <Coins className="w-5 h-5" />,
      value: decodedReports?.erc20
        ? formatERC20Value(String(decodedReports.erc20))
        : "0",
      address: decodedReports?.erc20
        ? String(decodedReports.erc20).split(",")[0] || "N/A"
        : null,
    },
    {
      title: "ERC-721",
      icon: <ImageIcon className="w-5 h-5" />,
      value: decodedReports?.erc721
        ? String(decodedReports.erc721).split(",")[1] || "0"
        : "0",
      address: decodedReports?.erc721
        ? String(decodedReports.erc721).split(",")[0] || "N/A"
        : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* CTSI Reward Card */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#3D2250] to-[#1E1632] p-1">
        <div className="bg-black/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-zinc-400 text-sm font-medium">CTSI Reward</h2>
              <div className="text-4xl font-bold text-white font-mono tracking-tight">
                {isLoading ? (
                  <div className="animate-pulse h-9 w-24 bg-white/10 rounded" />
                ) : (
                  Number(userDetails?.cartesiTokenBalance || "0").toFixed(4)
                )}
              </div>
            </div>
            <Coins className="w-12 h-12 text-[#950844] opacity-50" />
          </div>
        </div>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balanceCards.map((card, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 rounded-xl p-4 backdrop-blur-sm
              border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                {card.icon}
                {card.title}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">
                {String(card.value)}
              </div>
              {card.address && (
                <div className="text-xs text-zinc-500 truncate">
                  {card.address}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-all duration-200",
          "bg-gradient-to-r from-[#950844] to-[#7e0837]",
          "hover:from-[#7e0837] hover:to-[#950844]",
          "text-white flex items-center justify-center gap-2",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Balance</span>
          </>
        )}
      </button>
    </div>
  );
};

export default Balance;
