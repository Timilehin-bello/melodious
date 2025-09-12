"use client";

import React, { useState } from "react";
import { useMyReferralData, useConvertMeloPoints } from "@/hooks/useReferral";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  X,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Dialog, Tab } from "@headlessui/react";

// Convert Points Modal Component
const ConvertPointsModal = ({
  isOpen,
  onClose,
  stats,
  conversionInfo,
  convertMutation,
  refetch,
}: any) => {
  const [convertAmount, setConvertAmount] = useState("");
  const activeAccount = useActiveAccount();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (Number(value) >= 0 || value === "") {
      setConvertAmount(value);
    }
  };

  const handleConvert = async () => {
    const amount = parseInt(convertAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (
      !conversionInfo?.minConversion ||
      amount < conversionInfo.minConversion
    ) {
      toast.error(
        `Minimum conversion amount is ${
          conversionInfo?.minConversion || 100
        } Melo points`
      );
      return;
    }

    if (
      !stats?.statistics?.currentBalance ||
      amount > stats.statistics.currentBalance
    ) {
      toast.error("Insufficient Melo points balance");
      return;
    }

    if (!activeAccount?.address) {
      toast.error("Wallet not connected");
      return;
    }

    convertMutation.mutate(
      {
        walletAddress: activeAccount.address,
        meloPoints: amount,
      },
      {
        onSuccess: () => {
          setConvertAmount("");

          refetch();
          onClose();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Conversion failed");
        },
      }
    );
  };

  const calculateCtsiAmount = (meloPoints: number) => {
    if (!conversionInfo?.conversionRate) return 0;
    return (meloPoints / conversionInfo.conversionRate).toFixed(4);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#181425] p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#950844]" />
              Convert Melo Points
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">
                Melo Points to Convert
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={convertAmount}
                  onChange={handleChange}
                  className={cn(
                    "w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-[#950844] focus:border-transparent",
                    "placeholder-zinc-500 text-white text-lg",
                    "transition-all duration-200"
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                  MP
                </span>
              </div>
            </div>

            {/* Conversion Info */}
            {convertAmount && (
              <div className="bg-zinc-800/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">You will receive:</span>
                  <span className="text-white font-medium">
                    {calculateCtsiAmount(parseInt(convertAmount))} CTSI
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Conversion Rate:</span>
                  <span className="text-zinc-400">
                    {conversionInfo?.conversionRate || 0} MP = 1 CTSI
                  </span>
                </div>
              </div>
            )}

            {/* Balance Info */}
            <div className="flex justify-between items-center text-sm text-zinc-400">
              <span>Available Balance</span>
              <span className="font-medium">
                {stats?.statistics?.currentBalance || 0} MP
              </span>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={convertMutation.isPending || !convertAmount}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium",
                "bg-gradient-to-r from-[#950844] to-[#7e0837]",
                "hover:from-[#7e0837] hover:to-[#950844]",
                "text-white transition-all duration-200",
                "flex items-center justify-center gap-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {convertMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5" />
                  Convert Points
                </>
              )}
            </button>

            {/* Info Text */}
            <p className="text-xs text-zinc-500 text-center">
              Converting points may take a few moments to process
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const ArtistReferrals = () => {
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [referralsToShow, setReferralsToShow] = useState(10);
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

  const handleCopyReferralCode = () => {
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
    });
  };

  const calculateCtsiAmount = (meloPoints: number) => {
    if (!conversionInfo?.conversionRate) return 0;
    return (meloPoints * conversionInfo.conversionRate).toFixed(6);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-[#950844]" />
            <p className="text-zinc-400">Loading your referral data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen  text-white p-6">
        <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm text-center max-w-md mx-auto mt-20">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Loading Data
          </h3>
          <p className="text-zinc-400 mb-4">
            {error?.message ||
              "An error occurred while loading your referral information"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#950844] hover:bg-[#7e0837] text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8 w-full">
          <div className="max-w-7xl mx-auto">
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
                    onClick={handleCopyReferralCode}
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
        <div className="max-w-7xl mx-auto">
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
                          {stats.recentReferrals
                            .slice(0, referralsToShow)
                            .map((referral: any) => (
                              <div
                                key={referral.id}
                                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <div>
                                    <p className="text-sm font-medium text-white">
                                      {referral.referredName ||
                                        referral.referrerName ||
                                        `${referral.referredWalletAddress.slice(
                                          0,
                                          6
                                        )}...${referral.referredWalletAddress.slice(
                                          -4
                                        )}`}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {referral.referredWalletAddress.slice(
                                        0,
                                        6
                                      )}
                                      ...
                                      {referral.referredWalletAddress.slice(
                                        -4
                                      )}{" "}
                                      • {formatDate(referral.completedAt)}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className=" text-green-500 border-green-500"
                                >
                                  +{referral.pointsEarned} points
                                </Badge>
                              </div>
                            ))}
                          {stats.recentReferrals.length > referralsToShow && (
                            <div className="text-center pt-4">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setReferralsToShow((prev) => prev + 10)
                                }
                                className="text-[#950844] border-[#950844] hover:bg-[#950844] hover:text-white"
                              >
                                Load More (
                                {stats.recentReferrals.length - referralsToShow}{" "}
                                remaining)
                              </Button>
                            </div>
                          )}
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
                      ) : stats?.recentTransactions &&
                        stats.recentTransactions.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentTransactions.map((transaction: any) => (
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

                              <Badge
                                variant="outline"
                                className=" text-green-500 border-green-500"
                              >
                                {transaction.type === "EARNED" ? "+" : "-"}
                                {transaction.meloPoints} MP
                                {transaction.ctsiAmount && (
                                  <p className="text-xs ">
                                    +{transaction.ctsiAmount.toFixed(4)} CTSI
                                  </p>
                                )}
                              </Badge>
                              {/* <div className="text-right">
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
                                  <p className="text-xs text-zinc-400">
                                    +{transaction.ctsiAmount.toFixed(4)} CTSI
                                  </p>
                                )}
                              </div> */}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-[#950844]" />
                          </div>
                          <p className="text-zinc-300 font-medium mb-2">
                            No transactions yet
                          </p>
                          <p className="text-sm text-zinc-500">
                            Start referring to see your activity
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

        {/* Convert Points Modal */}
        <ConvertPointsModal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          stats={stats}
          conversionInfo={conversionInfo}
          convertMutation={convertMutation}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default ArtistReferrals;
