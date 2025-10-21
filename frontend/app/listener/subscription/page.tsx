"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActiveAccount } from "thirdweb/react";
import toast from "react-hot-toast";
import {
  CreditCard,
  Check,
  Star,
  Music,
  Crown,
  Zap,
  Shield,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  useCartesiSubscribe,
  useCartesiSubscriptionStatus,
  useSubscriptionPrice,
} from "@/hooks/useCartesiSubscription";
import { ethers } from "ethers";

// Define the plan interface
interface Plan {
  id: number;
  name: string;
  price: number;
  duration: number;
  features: string[];
}

// Hardcoded subscription plans with benefits
const subscriptionPlans: Plan[] = [
  {
    id: 1,
    name: "Basic",
    price: 0,
    duration: 30,
    features: [
      "Access to limited music library",
      "Ad-supported listening",
      "Standard audio quality",
      "Basic playlist creation",
      "Community features access",
    ],
  },
  {
    id: 2,
    name: "Premium",
    price: 0, // This will be replaced by useSubscriptionPrice
    duration: 30,
    features: [
      "Ad-free listening",
      "Access to full music library",
      "High-fidelity audio (320kbps)",
      "Offline downloads",
      "Unlimited playlist creation",
      "Enhanced artist support",
      "Priority customer support",
      "Exclusive content access",
      "Early access to new releases",
    ],
  },
];

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
  const activeAccount = useActiveAccount();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // TanStack Query hooks
  const { data: subscriptionPrice, isLoading: priceLoading } =
    useSubscriptionPrice();
  const subscriptionStatus = useCartesiSubscriptionStatus(
    activeAccount?.address
  );
  const cartesiSubscribe = useCartesiSubscribe();

  // Computed states
  const isProcessing = cartesiSubscribe.isPending;
  const isLoadingSubscriptionStatus = subscriptionStatus.isLoading;
  const hasActiveSubscription =
    subscriptionStatus.data?.hasActiveSubscription || false;
  const currentSubscription = subscriptionStatus.data?.subscriptionLevel;

  // Reset selected plan when account changes
  React.useEffect(() => {
    console.log("useCartesiSubscriptionStatus", subscriptionStatus.data);
    setSelectedPlan(null);
  }, [activeAccount, subscriptionStatus.data]);

  const handleSubscription = async (plan: Plan) => {
    if (!activeAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (plan.price === 0) {
      toast.success("You're already on the free plan!");
      return;
    }

    if (hasActiveSubscription) {
      toast.error("You already have an active subscription");
      return;
    }

    setSelectedPlan(plan.id.toString());

    try {
      await cartesiSubscribe.mutateAsync({
        subscriptionLevel: plan.name.toUpperCase(),
        amount: plan.price,
      });

      setSelectedPlan(null);
    } catch (error) {
      console.error("Subscription failed:", error);
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
          {subscriptionPlans.map((plan, index) => {
            const displayProps = getPlanDisplayProps(plan.id);
            // Use subscription price from hook for Premium plan
            const planPrice =
              plan.id === 2 ? subscriptionPrice || 100 : plan.price;

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
                    currentSubscription === plan.name.toLowerCase() &&
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
                        {planPrice === 0 ? "Free" : `${planPrice} CTSI`}
                      </span>
                      <span className="text-zinc-400 ml-2">
                        {plan.duration} days
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
                    currentSubscription === plan.name.toLowerCase() ? (
                      <Button
                        disabled
                        className="w-full bg-green-600 hover:bg-green-600 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleSubscription({
                            ...plan,
                            price: Number(planPrice),
                          })
                        }
                        disabled={isProcessing || hasActiveSubscription}
                        className={cn(
                          "w-full transition-all duration-200",
                          hasActiveSubscription
                            ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                            : planPrice === 0
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
                        ) : planPrice === 0 ? (
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

        {/* Subscription Status Display */}
        {isLoadingSubscriptionStatus ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 max-w-7xl mx-auto"
          >
            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500 mr-2" />
                <span className="text-zinc-300">
                  Loading subscription status...
                </span>
              </CardContent>
            </Card>
          </motion.div>
        ) : hasActiveSubscription && subscriptionStatus.data ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 max-w-7xl mx-auto"
          >
            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Active Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Plan:</span>
                  <span className="text-white font-semibold">
                    {subscriptionStatus.data.subscriptionLevel}
                  </span>
                </div>
                {subscriptionStatus.data.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Expires:</span>
                    <span className="text-white">
                      {new Date(
                        subscriptionStatus.data.expiresAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="mt-4 p-3 bg-green-900/20 border max-w-7xl border-green-800/50 rounded-lg">
                  <p className="text-green-400 text-sm">
                    🎉 Your subscription is active! Enjoy your premium features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default SubscriptionPage;
