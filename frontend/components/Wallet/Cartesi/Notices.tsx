"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotices } from "@/cartesi/hooks/useNotices";
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  Bell,
  XCircle,
  Coins,
  Image,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const NoticeCard = ({ notice }: { notice: any }) => {
  const payloadIsJSON = (payload: any) => {
    try {
      JSON.parse(payload);
      return true;
    } catch (e) {
      return false;
    }
  };

  const formatAddress = (address: string) => {
    if (address.length > 42) {
      // If it's longer than a standard ETH address
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const getNoticeContent = (notice: any) => {
    if (!payloadIsJSON(notice.payload)) {
      return {
        type: "DappAddressRelay",
        content: formatAddress(notice.payload),
        icon: <Wallet className="w-4 h-4" />,
        fullContent: notice.payload, // Store full address for tooltip
      };
    }
    const payload = JSON.parse(notice.payload);
    const content = payload.content;

    switch (payload.type) {
      case "etherdeposit":
        return {
          type: "Ether Deposit",
          content: `${ethers.utils.formatEther(
            content.amount
          )} Ξ deposited to ctsi account ${content.address}`,
          icon: <Coins className="w-4 h-4" />,
        };
      case "erc20deposit":
        return {
          type: "ERC20 Deposit",
          content: `${ethers.utils.formatEther(
            content.amount
          )} tokens deposited to ctsi account ${content.address}
           ERC20 address: ${content.erc20}`,
          icon: <Coins className="w-4 h-4" />,
        };
      case "erc721deposit":
        return {
          type: "NFT Deposit",
          content: (
            <>
              NFT address{" "}
              <span className="px-2 py-1 text-xs bg-purple-900 rounded-full">
                {content.erc721}
              </span>{" "}
              and id {content.token_id} transferred to ctsi account{" "}
              {content.address}
            </>
          ),
          icon: <Image className="w-4 h-4" />,
        };
      default:
        return {
          type: payload.type,
          content: JSON.stringify(content),
          icon: <Bell className="w-4 h-4" />,
        };
    }
  };

  const { type, content, icon, fullContent } = getNoticeContent(notice);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullContent);
    toast.success("Content copied to clipboard", {
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-lg",
        "border border-zinc-800/50",
        "bg-zinc-900/50",
        "hover:bg-zinc-800/30 transition-all duration-200"
      )}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          className={cn(
            "p-2 rounded-lg shrink-0",
            "bg-[#950944] text-white",
            "flex items-center gap-2",
            "w-fit"
          )}
        >
          {icon}
          <span className="text-sm font-medium whitespace-nowrap">{type}</span>
        </div>
        <div className="flex-1 min-w-0">
          {type === "DappAddressRelay" ? (
            <div className="flex items-center gap-2">
              <div
                className="text-sm text-zinc-300 font-mono hover:text-white cursor-pointer transition-colors"
                title={fullContent}
              >
                {content}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
                title="Copy full address"
              >
                <svg
                  className="w-4 h-4 text-zinc-400 hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="text-sm text-zinc-300 break-words">
              {typeof content === "string" ? (
                <div className="break-all">{content}</div>
              ) : (
                content
              )}
            </div>
          )}
          <div className="mt-2 text-xs text-zinc-500">
            Input Index: {notice.input.index} • Notice Index: {notice.index}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Notices: React.FC = () => {
  const { loading, error, data, notices, refetch } = useNotices();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refetch({ requestPolicy: "network-only" });
  }, [refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch({ requestPolicy: "network-only" });
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading notices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-400">
        <XCircle className="w-6 h-6 mr-2" />
        <span>Error: {error.message}</span>
      </div>
    );
  }

  if (!data || !data.notices) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>No notices available</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4">
      {" "}
      {/* Added px-4 for mobile padding */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">Notices</h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium",
              "bg-zinc-800 hover:bg-zinc-700",
              "text-zinc-300 hover:text-white",
              "transition-all duration-200",
              "flex items-center gap-2 shrink-0", // Added shrink-0
              isRefreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Notices List */}
        <div className="space-y-4 overflow-hidden">
          {" "}
          {/* Added overflow-hidden */}
          <AnimatePresence>
            {notices.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                No notices to display
              </div>
            ) : (
              notices.map((notice: any) => (
                <NoticeCard
                  key={`${notice.input.index}-${notice.index}`}
                  notice={notice}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Notices;
