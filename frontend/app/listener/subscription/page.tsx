"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMelodiousContext } from "@/contexts/melodious";
import { useActiveAccount } from "thirdweb/react";
import { depositErc20ToPortal } from "@/cartesi/Portals";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SubscriptionVouchers } from "@/components/Subscription/SubscriptionVouchers";
import { useVouchers } from "@/cartesi/hooks/useVouchers";
import { executeVoucher } from "@/cartesi/Portals";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    duration: "Forever",
    features: [
      "Access to limited music library",
      "Ad-supported listening",
      "Standard audio quality",
      "Basic playlist creation",
    ],
    icon: <Music className="w-6 h-6" />,
    color: "text-zinc-400",
    gradient: "from-zinc-600 to-zinc-700",
  },
  {
    id: "premium",
    name: "Premium",
    price: 100,
    duration: "per month",
    popular: true,
    features: [
      "Ad-free listening",
      "Access to full music library",
      "High-fidelity audio (320kbps)",
      "Offline downloads",
      "Unlimited playlist creation",
      "Enhanced artist support",
      "Priority customer support",
      "Exclusive content access",
    ],
    icon: <Crown className="w-6 h-6" />,
    color: "text-purple-400",
    gradient: "from-purple-500 to-purple-600",
  },
];

const SubscriptionPage = () => {
  const { rollups, dappAddress, signMessages } = useMelodiousContext();
  const activeAccount = useActiveAccount();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(
    null
  );
  const [signerInstance, setSignerInstance] = useState<ethers.Signer>();
  const [showVouchers, setShowVouchers] = useState(false);
  const [subscriptionTxHash, setSubscriptionTxHash] = useState<string | null>(
    null
  );
  const {
    loading: vouchersLoading,
    error: vouchersError,
    data: vouchersData,
    vouchers,
    refetch: refetchVouchers,
    client: apolloClient,
  } = useVouchers();

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

  useEffect(() => {
    // TODO: Fetch current subscription status from backend or Cartesi
    // This would typically involve checking the user's current subscription
    setCurrentSubscription("free"); // Default to free for now
  }, [activeAccount]);

  const handleVoucherExecution = async (voucher: any) => {
    if (!rollups || !apolloClient) {
      toast.error("Unable to execute voucher. Please try again.");
      return;
    }

    try {
      toast.loading("Executing voucher...", { id: "voucher-execution" });

      const result = await executeVoucher(apolloClient, voucher, rollups);

      if (
        result &&
        typeof result === "string" &&
        result.includes("successfully")
      ) {
        toast.success(
          "Subscription activated successfully! You can now enjoy your premium features.",
          {
            id: "voucher-execution",
          }
        );
        setShowVouchers(false);
      } else {
        toast.error("Failed to execute voucher. Please try again.", {
          id: "voucher-execution",
        });
      }
    } catch (error: any) {
      console.error("Voucher execution error:", error);
      toast.error(
        error?.message || "Error executing voucher. Please try again.",
        {
          id: "voucher-execution",
        }
      );
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

    setIsProcessing(true);
    setSelectedPlan(plan.id);

    try {
      // CTSI token address (Cartesi Token)
      const tokenAddress = process.env.NEXT_PUBLIC_CARTESI_TOKEN_ADDRESS!;
      const amount = plan.price;

      toast.loading("Processing subscription payment...", {
        id: "subscription",
      });

      // Step 1: Deposit ERC20 tokens to portal
      if (rollups && signerInstance) {
        const depositResult = await depositErc20ToPortal(
          rollups,
          signerInstance,
          tokenAddress,
          amount,
          dappAddress
        );

        if (depositResult && (depositResult as any).transactionHash) {
          // Step 2: Create vault deposit payload
          const vaultPayload = {
            method: "vault_deposit",
            args: {
              amount,
            },
          };

          // Step 3: Sign and send to server relayer
          const relayResult = await signMessages(vaultPayload);

          if (relayResult?.status) {
            toast.success(
              `Successfully subscribed to ${plan.name} plan! Please execute the voucher below to activate your subscription.`,
              { id: "subscription" }
            );
            setCurrentSubscription(plan.id);
            setSubscriptionTxHash((depositResult as any).transactionHash);
            setShowVouchers(true);
          } else {
            toast.error("Vault deposit failed. Please try again.", {
              id: "subscription",
            });
          }
        } else {
          toast.error("Token deposit failed. Please try again.", {
            id: "subscription",
          });
        }
      }
    } catch (error: any) {
      console.error("Subscription error:", error);

      // Format and display specific error messages
      let errorMessage =
        "An error occurred while processing your subscription.";

      if (error?.message) {
        // Handle specific error types from depositErc20ToPortal
        if (error.message.includes("Insufficient token balance")) {
          errorMessage =
            "Insufficient CTSI token balance. Please add more tokens to your wallet.";
        } else if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was cancelled. Please try again.";
        } else if (error.message.includes("Transaction failed")) {
          errorMessage =
            "Transaction failed. Please check your wallet and try again.";
        } else if (error.message.includes("Invalid parameters")) {
          errorMessage =
            "Invalid subscription parameters. Please refresh and try again.";
        } else if (error.message.includes("Network error")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else {
          // Use the original error message if it's user-friendly
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, {
        id: "subscription",
      });
    } finally {
      setIsProcessing(false);
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
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              {plan.popular && (
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
                  currentSubscription === plan.id &&
                    "border-green-500/50 shadow-green-500/20",
                  plan.popular && "border-purple-500/50 shadow-purple-500/20"
                )}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={cn(
                      "inline-flex p-3 rounded-full mb-4 bg-gradient-to-r",
                      plan.gradient
                    )}
                  >
                    <div className="text-white">{plan.icon}</div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white">
                      {plan.price === 0 ? "Free" : `${plan.price} CTSI`}
                    </span>
                    <span className="text-zinc-400 ml-2">{plan.duration}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {currentSubscription === plan.id ? (
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
                      disabled={isProcessing}
                      className={cn(
                        "w-full transition-all duration-200",
                        plan.price === 0
                          ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                      )}
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
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
          ))}
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
