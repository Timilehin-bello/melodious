"use client";

import React, { useState } from "react";
import { useMyReferralData, useConvertMeloPoints } from "@/hooks/useReferral";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tab } from "@headlessui/react";
import {
  Users,
  Gift,
  Coins,
  ArrowUpRight,
  Copy,
  RefreshCw,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useActiveAccount } from "thirdweb/react";

const ReferralsPage = () => {
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const activeAccount = useActiveAccount();

  const {
    stats,
    transactions,
    conversionInfo,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyReferralData();

  const convertMutation = useConvertMeloPoints();

  const copyReferralCode = () => {
    if (stats?.user?.referralCode) {
      navigator.clipboard.writeText(stats.user.referralCode);
      toast.success("Referral code copied to clipboard!");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="h-8 bg-zinc-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="h-4 bg-zinc-700 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-zinc-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="h-6 bg-zinc-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-zinc-700 rounded"></div>
                  <div className="h-10 bg-zinc-700 rounded"></div>
                </div>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="h-6 bg-zinc-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-zinc-700 rounded"></div>
                  <div className="h-10 bg-zinc-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Error Loading Data
          </h2>
          <p className="text-zinc-400 mb-6 text-center max-w-md">
            {error?.message ||
              "Something went wrong while loading your referral data"}
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-[#8280FF] hover:bg-[#7066FF] text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-8 h-8 text-[#950844]" />
                    <h1 className="text-3xl font-bold text-white">
                      Referral Program
                    </h1>
                  </div>
                  <p className="text-zinc-400">
                    Grow your network and earn Melo points
                  </p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  Total Referrals
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats?.statistics?.totalReferrals || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">Melo Points</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.statistics?.currentBalance || 0}
                </p>
              </div>
              <Coins className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  Points Earned
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats?.statistics?.totalPointsEarned || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">CTSI Earned</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.statistics?.totalCtsiReceived?.toFixed(4) || "0.0000"}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-[#950844]" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Code Section */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-[#950844]" />
                  Your Referral Code
                </h3>
                <p className="text-zinc-400">
                  Share this code with friends to earn{" "}
                  {conversionInfo?.referralPoints || 100} Melo points per
                  referral
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    value={stats?.user?.referralCode || "Loading..."}
                    readOnly
                    className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white font-mono focus:outline-none"
                  />
                  <button
                    onClick={copyReferralCode}
                    disabled={!stats?.user?.referralCode}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-zinc-400">
                  <p>Share this code when someone signs up to earn rewards!</p>
                </div>
              </div>
            </div>

            {/* Convert Points Section */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-[#950844]" />
                  Convert to CTSI
                </h3>
                <p className="text-zinc-400">
                  Convert your Melo points to CTSI tokens
                  {conversionInfo?.conversionRate && (
                    <span className="block mt-1 text-[#950844]">
                      Rate: {conversionInfo.conversionRate} MP = 1 CTSI
                    </span>
                  )}
                </p>
              </div>
              {!activeAccount ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                  <p className="text-zinc-400 mb-4">
                    Connect your wallet to convert points
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-[#950844] to-[#7e0837] hover:from-[#7e0837] hover:to-[#950844] text-white rounded-lg transition-all">
                    Connect Wallet
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setIsConvertModalOpen(true)}
                    disabled={
                      !stats?.statistics?.currentBalance ||
                      stats.statistics.currentBalance === 0
                    }
                    className={cn(
                      "w-full px-6 py-4 rounded-lg font-medium transition-all",
                      "bg-gradient-to-r from-[#950844] to-[#7e0837]",
                      "hover:from-[#7e0837] hover:to-[#950844]",
                      "text-white flex items-center justify-center gap-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    Convert Points
                  </button>
                  <div className="text-sm text-zinc-400 text-center">
                    Available: {stats?.statistics?.currentBalance || 0} MP
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-6">
              Recent Activity
            </h2>
            <div className="bg-zinc-900/30 rounded-xl backdrop-blur-sm border border-zinc-800/50">
              <Tab.Group>
                <div className="border-b border-zinc-800/50">
                  <Tab.List className="flex">
                    <Tab
                      className={({ selected }) =>
                        cn(
                          "px-6 py-4 text-sm font-medium outline-none",
                          "flex items-center gap-2 transition-all duration-200",
                          selected
                            ? "text-[#950844] border-b-2 border-[#950844]"
                            : "text-zinc-400 hover:text-zinc-300"
                        )
                      }
                    >
                      <Users className="w-4 h-4" />
                      Referrals
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        cn(
                          "px-6 py-4 text-sm font-medium outline-none",
                          "flex items-center gap-2 transition-all duration-200",
                          selected
                            ? "text-[#950844] border-b-2 border-[#950844]"
                            : "text-zinc-400 hover:text-zinc-300"
                        )
                      }
                    >
                      <Clock className="w-4 h-4" />
                      Transactions
                    </Tab>
                  </Tab.List>
                </div>

                <Tab.Panels className="p-6">
                  {/* Referrals Tab */}
                  <Tab.Panel className={cn("focus:outline-none")}>
                    <div className="space-y-6">
                      {isLoading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                  <div className="space-y-1">
                                    <div className="w-24 h-4 bg-gray-600 rounded"></div>
                                    <div className="w-16 h-3 bg-gray-700 rounded"></div>
                                  </div>
                                </div>
                                <div className="w-16 h-6 bg-gray-600 rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : stats?.recentReferrals &&
                        stats.recentReferrals.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentReferrals.map((referral: any) => (
                            <div
                              key={referral.id}
                              className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {referral.referredWalletAddress.slice(0, 6)}
                                    ...
                                    {referral.referredWalletAddress.slice(-4)}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatDate(referral.completedAt)}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30"
                              >
                                +{referral.pointsEarned} points
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-[#950844]" />
                          </div>
                          <p className="text-zinc-300 font-medium mb-2">
                            No referrals yet
                          </p>
                          <p className="text-sm text-zinc-500">
                            Share your referral code to get started
                          </p>
                        </div>
                      )}
                    </div>
                  </Tab.Panel>

                  {/* Transactions Tab */}
                  <Tab.Panel className={cn("focus:outline-none")}>
                    <div className="space-y-6">
                      {isLoading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                  <div className="space-y-1">
                                    <div className="w-32 h-4 bg-gray-600 rounded"></div>
                                    <div className="w-20 h-3 bg-gray-700 rounded"></div>
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="w-16 h-4 bg-gray-600 rounded ml-auto"></div>
                                  <div className="w-12 h-3 bg-gray-700 rounded ml-auto"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : transactions && transactions.length > 0 ? (
                        <div className="space-y-3">
                          {transactions.map((transaction: any) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {transaction.type === "EARNED" ? (
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-[#950844]" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {transaction.description}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatDate(transaction.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    transaction.type === "EARNED"
                                      ? "text-green-400"
                                      : "text-[#950844]"
                                  )}
                                >
                                  {transaction.type === "EARNED" ? "+" : "-"}
                                  {transaction.meloPoints} MP
                                </p>
                                {transaction.ctsiAmount && (
                                  <p className="text-xs text-gray-400">
                                    +{transaction.ctsiAmount.toFixed(4)} CTSI
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-zinc-500" />
                          </div>
                          <p className="text-zinc-300 font-medium mb-2">
                            No transactions yet
                          </p>
                          <p className="text-sm text-zinc-500">
                            Start referring friends to earn points
                          </p>
                        </div>
                      )}
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;
