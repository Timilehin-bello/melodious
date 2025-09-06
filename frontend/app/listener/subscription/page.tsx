"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMelodiousContext } from "@/contexts/melodious";
import { useActiveAccount } from "thirdweb/react";
import { depositErc20ToPortal, depositErc20ToVault } from "@/cartesi/Portals";
import toast from "react-hot-toast";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { client } from "@/lib/client";
import { networkChain } from "@/components/ConnectWallet";
import { ethers } from "ethers";
import {
  CreditCard,
  Check,
  Star,
  Music,
  Download,
  Headphones,
  Crown,
  Zap,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SubscriptionVouchers } from "@/components/Subscription/SubscriptionVouchers";
import { useVouchers } from "@/cartesi/hooks/useVouchers";
import { executeVoucher } from "@/cartesi/Portals";
import {
  useDepositFirstSubscription,
  useManualVoucherExecution,
  DepositWorkflowState,
  DepositWorkflowStatus,
  DepositFirstSubscriptionRequest,
} from "@/hooks/useDepositFirstSubscription";
import {
  useSubscriptionPlans,
  useSubscriptionStatus,
} from "@/hooks/useSubscription";
import { SubscriptionPlan } from "@/types/subscription";

// Remove local interface - using the one from types/subscription.ts
// Local UI helper function to get plan display properties
const getPlanDisplayProps = (planId: number) => {
  const props = {
    1: {
      icon: <Music className="w-6 h-6" />,
      color: "text-zinc-400",
      gradient: "from-zinc-600 to-zinc-700",
      popular: false,
    },
    2: {
      icon: <Crown className="w-6 h-6" />,
      color: "text-purple-400",
      gradient: "from-purple-500 to-purple-600",
      popular: true,
    },
  };
  return props[planId as keyof typeof props] || props[1];
};

const SubscriptionPage = () => {
  const { rollups, dappAddress } = useMelodiousContext();
  const activeAccount = useActiveAccount();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [signerInstance, setSignerInstance] = useState<ethers.Signer>();
  const [workflowState, setWorkflowState] =
    useState<DepositWorkflowState | null>(null);

  // TanStack Query hooks
  const { data: subscriptionPlans, isLoading: plansLoading } =
    useSubscriptionPlans();
  const {
    activeSubscription,
    hasActiveSubscription,
    isLoading: statusLoading,
  } = useSubscriptionStatus();
  const depositFirstSubscription = useDepositFirstSubscription();
  const manualVoucherExecution = useManualVoucherExecution();

  // Cartesi hooks
  const {
    loading: vouchersLoading,
    error: vouchersError,
    data: vouchersData,
    vouchers,
    refetch: refetchVouchers,
    client: apolloClient,
  } = useVouchers();

  // Computed states
  const isProcessing =
    depositFirstSubscription.isPending || manualVoucherExecution.isPending;
  const currentSubscription = hasActiveSubscription
    ? activeSubscription?.plan?.name?.toLowerCase()
    : "free";

  // Get signer instance from thirdweb account
  useEffect(() => {
    const getSigner = async () => {
      if (activeAccount) {
        const ethersSigner = ethers5Adapter.signer.toEthers({
          client,
          chain: networkChain!,
          account: activeAccount,
        });
        setSignerInstance(await ethersSigner);
      }
    };
    getSigner();
  }, [activeAccount]);

  // Reset workflow state when account changes
  useEffect(() => {
    setWorkflowState(null);
    setSelectedPlan(null);
  }, [activeAccount]);

  const handleVoucherExecution = async (voucher: any) => {
    if (!rollups || !apolloClient) {
      toast.error("Unable to execute voucher. Please try again.");
      return;
    }

    try {
      await manualVoucherExecution.mutateAsync({
        voucher,
        rollups,
        apolloClient,
        subscriptionId: workflowState?.subscriptionId,
        amount: workflowState?.subscriptionId
          ? subscriptionPlans?.find((p) => p.id.toString() === selectedPlan)
              ?.price
          : undefined,
        currency: "CTSI",
        depositTxHash: workflowState?.depositTxHash,
      });
    } catch (error) {
      console.error("Manual voucher execution failed:", error);
    }
  };

  const handleSubscription = async (plan: SubscriptionPlan) => {
    if (!activeAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (plan.price === 0) {
      toast.success("You're already on the free plan!");
      return;
    }

    if (!rollups || !signerInstance) {
      toast.error("Wallet or rollups not ready. Please try again.");
      return;
    }

    setSelectedPlan(plan.id.toString());
    setWorkflowState(null);

    // CTSI token address (Cartesi Token)
    const tokenAddress = process.env.NEXT_PUBLIC_CARTESI_TOKEN_ADDRESS!;

    if (!tokenAddress) {
      toast.error("Token address not configured. Please contact support.");
      return;
    }

    const request: DepositFirstSubscriptionRequest = {
      planType: plan.name.toUpperCase(),
      planId: plan.id,
      amount: plan.price,
      currency: "CTSI",
      tokenAddress,
      dappAddress,
      autoRenew: true,
    };

    try {
      await depositFirstSubscription.mutateAsync({
        request,
        rollups,
        signer: signerInstance,
        onStatusChange: (state: DepositWorkflowState) => {
          setWorkflowState(state);

          // Show progress toasts
          if (state.status === DepositWorkflowStatus.DEPOSITING) {
            toast.loading(state.currentStep, { id: "workflow" });
          } else if (state.status === DepositWorkflowStatus.DEPOSIT_COMPLETED) {
            toast.dismiss("workflow"); // Stop the loading toast
            toast.success(state.currentStep, { duration: 5000 }); // Show success message for longer
          } else if (
            state.status === DepositWorkflowStatus.CREATING_SUBSCRIPTION
          ) {
            toast.loading(state.currentStep, { id: "workflow" });
          } else if (
            state.status === DepositWorkflowStatus.SUBSCRIPTION_CREATED
          ) {
            toast.success(state.currentStep, { id: "workflow" });
          } else if (state.status === DepositWorkflowStatus.EXECUTING_VOUCHER) {
            // No toast - rely on loading bar to show progress
          } else if (
            state.status === DepositWorkflowStatus.PROCESSING_PAYMENT
          ) {
            toast.loading(state.currentStep, { id: "workflow" });
          } else if (state.status === DepositWorkflowStatus.FAILED) {
            toast.error(`${state.currentStep}: ${state.error}`, {
              id: "workflow",
            });
          }
        },
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Subscription workflow failed:", error);
    } finally {
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-main-content-gradient bg-cover bg-center p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">
              Music Plan
            </span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            Unlock the full potential of Melodious with our subscription plans.
            Support artists and enjoy premium features.
          </p>
        </motion.div>

        {/* Subscription Plans Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto"
        >
          {subscriptionPlans?.map((plan, index) => {
            const displayProps = getPlanDisplayProps(plan.id);
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                {displayProps.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={cn(
                    "h-full bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm transition-all duration-300",
                    "hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20",
                    currentSubscription === plan.id.toString() &&
                      "border-green-500/50 shadow-green-500/20",
                    displayProps.popular &&
                      "border-purple-500/50 shadow-purple-500/20"
                  )}
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={cn(
                        "inline-flex p-3 rounded-full mb-4 bg-gradient-to-r",
                        displayProps.gradient
                      )}
                    >
                      <div className="text-white">{displayProps.icon}</div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="text-center">
                      <span className="text-4xl font-bold text-white">
                        {plan.price === 0 ? "Free" : `${plan.price} CTSI`}
                      </span>
                      <span className="text-zinc-400 ml-2">
                        {plan.duration}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3"
                        >
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-zinc-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {hasActiveSubscription &&
                    activeSubscription?.plan?.id === plan.id ? (
                      <Button
                        disabled
                        className="w-full bg-green-600 hover:bg-green-600 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscription(plan)}
                        disabled={isProcessing || hasActiveSubscription}
                        className={cn(
                          "w-full transition-all duration-200",
                          hasActiveSubscription
                            ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                            : plan.price === 0
                            ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                        )}
                      >
                        {isProcessing && selectedPlan === plan.id.toString() ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : hasActiveSubscription ? (
                          "Already Subscribed"
                        ) : plan.price === 0 ? (
                          "Get Started"
                        ) : (
                          "Subscribe Now"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">
                Why Choose Melodious Premium?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Support Artists Directly
                  </h3>
                  <p className="text-zinc-400">
                    Your subscription directly supports the artists you love
                    through our decentralized platform.
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Blockchain Powered
                  </h3>
                  <p className="text-zinc-400">
                    Enjoy transparent, secure transactions powered by Cartesi
                    technology.
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Premium Experience
                  </h3>
                  <p className="text-zinc-400">
                    Access high-quality audio, exclusive content, and ad-free
                    listening.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workflow Status Display */}
        {workflowState &&
          workflowState.status !== DepositWorkflowStatus.IDLE && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    {workflowState.status === DepositWorkflowStatus.FAILED ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : workflowState.status ===
                      DepositWorkflowStatus.COMPLETED ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    )}
                    Subscription Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">
                      {workflowState.currentStep}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {workflowState.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${workflowState.progress}%` }}
                    />
                  </div>

                  {workflowState.status === DepositWorkflowStatus.FAILED &&
                    workflowState.error && (
                      <div className="mt-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
                        <p className="text-red-400 text-sm">
                          {workflowState.error}
                        </p>
                      </div>
                    )}

                  {workflowState.status === DepositWorkflowStatus.COMPLETED &&
                    hasActiveSubscription && (
                      <div className="mt-4 p-3 bg-green-900/20 border border-green-800/50 rounded-lg">
                        <p className="text-green-400 text-sm">
                          🎉 Subscription activated successfully! You can now
                          enjoy your premium features.
                        </p>
                      </div>
                    )}

                  {workflowState.voucherId &&
                    workflowState.status !==
                      DepositWorkflowStatus.COMPLETED && (
                      <div className="mt-4">
                        <Button
                          onClick={() =>
                            handleVoucherExecution({
                              id: workflowState.voucherId!,
                            })
                          }
                          disabled={manualVoucherExecution.isPending}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          {manualVoucherExecution.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Executing Voucher...
                            </>
                          ) : (
                            "Execute Voucher Manually"
                          )}
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            </motion.div>
          )}

        {/* Subscription Vouchers */}
        {activeAccount && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Your Subscription Vouchers
                </CardTitle>
                <p className="text-zinc-400">
                  Execute your subscription vouchers to activate your plan
                  benefits.
                </p>
              </CardHeader>
              <CardContent>
                <SubscriptionVouchers dappAddress={dappAddress} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
