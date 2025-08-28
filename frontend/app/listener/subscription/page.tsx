"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMelodiousContext } from "@/contexts/melodious";
import toast from "react-hot-toast";
import { addInput } from "@/cartesi/Portals";
import { 
  Crown, 
  Star, 
  Zap, 
  Check, 
  X, 
  Clock, 
  CreditCard,
  Calendar,
  Users,
  Music,
  Download,
  HeadphonesIcon,
  Gift,
  TrendingUp
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

interface UserSubscription {
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  nextBilling: string;
  autoRenew: boolean;
}

const SubscriptionManagement = () => {
  const { rollups, dappAddress } = useMelodiousContext();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock current subscription - in real app, this would be fetched from API
  useEffect(() => {
    // Simulate fetching user's current subscription
    setCurrentSubscription({
      plan: "premium_listener",
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      nextBilling: "2024-02-01",
      autoRenew: true
    });
  }, []);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "basic_listener",
      name: "Basic",
      price: 2.99,
      duration: "month",
      icon: <Music className="w-6 h-6" />,
      color: "from-gray-500 to-gray-700",
      bgGradient: "bg-gradient-to-br from-gray-800/90 to-gray-900/90",
      features: [
        "Ad-free music streaming",
        "Access to full music library",
        "Standard audio quality (320kbps)",
        "Create up to 10 playlists",
        "Mobile & desktop apps",
        "Skip unlimited tracks"
      ],
      current: currentSubscription?.plan === "basic_listener"
    },
    {
      id: "premium_listener",
      name: "Premium",
      price: 6.99,
      duration: "month",
      icon: <Star className="w-6 h-6" />,
      color: "from-purple-500 to-purple-700",
      bgGradient: "bg-gradient-to-br from-purple-800/90 to-purple-900/90",
      features: [
        "Everything in Basic",
        "High-fidelity audio (Hi-Res)",
        "Offline downloads",
        "Unlimited playlists",
        "Early access to new releases",
        "Exclusive listener events",
        "Advanced music discovery",
        "Priority customer support"
      ],
      popular: true,
      current: currentSubscription?.plan === "premium_listener"
    },
    {
      id: "audiophile",
      name: "Audiophile",
      price: 12.99,
      duration: "month",
      icon: <Crown className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-600",
      bgGradient: "bg-gradient-to-br from-yellow-600/90 to-orange-700/90",
      features: [
        "Everything in Premium",
        "Lossless audio (FLAC)",
        "Spatial audio support",
        "Exclusive unreleased tracks",
        "Direct artist support features",
        "Premium customer support",
        "Concert ticket pre-sales",
        "Artist meet & greet opportunities"
      ],
      current: currentSubscription?.plan === "audiophile"
    }
  ];

  const handleSubscription = async (plan: string, amount: number) => {
    setIsLoading(true);
    const jsonPayload = JSON.stringify({
      method: "subscribe",
      args: {
        plan,
        amount,
        type: "listener",
      },
    });
    
    let processingToastId: string | undefined;
    try {
      processingToastId = toast.loading("Processing subscription request...");

      const result = await addInput(rollups, jsonPayload, dappAddress);

      if (result && typeof result === 'object' && 'transactionHash' in result && result.transactionHash) {
        toast.success("Subscription updated successfully!", { id: processingToastId });
        // Update local state to reflect new subscription
        setCurrentSubscription({
          plan,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          autoRenew: true
        });
      } else {
        toast.error("Failed to update subscription. Please try again.", { id: processingToastId });
      }
    } catch (error) {
      console.error("Error during subscription:", error);
      if (processingToastId) {
        toast.error("An error occurred while processing your subscription.", { id: processingToastId });
      } else {
        toast.error("An error occurred while processing your subscription.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    const jsonPayload = JSON.stringify({
      method: "cancel_subscription",
      args: {
        type: "listener",
      },
    });

    let processingToastId: string | undefined;
    try {
      processingToastId = toast.loading("Cancelling subscription...");
      
      const result = await addInput(rollups, jsonPayload, dappAddress);

      if (result && typeof result === 'object' && 'transactionHash' in result && result.transactionHash) {
        toast.success("Subscription cancelled successfully!", { id: processingToastId });
        setCurrentSubscription(prev => prev ? { ...prev, status: 'cancelled', autoRenew: false } : null);
      } else {
        toast.error("Failed to cancel subscription. Please try again.", { id: processingToastId });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      if (processingToastId) {
        toast.error("An error occurred while cancelling your subscription.", { id: processingToastId });
      } else {
        toast.error("An error occurred while cancelling your subscription.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Subscription Management
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Manage your subscription, upgrade your plan, or explore new features
          </p>
        </div>

        {/* Current Subscription Card */}
        {currentSubscription && (
          <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <CreditCard className="w-6 h-6" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <span className="text-gray-100 font-medium">Plan:</span>
                  <Badge className="bg-purple-600 text-white border-0 font-semibold">
                    {subscriptionPlans.find(p => p.id === currentSubscription.plan)?.name || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <span className="text-gray-100 font-medium">Status:</span>
                  <Badge 
                    className={`border-0 font-semibold ${
                      currentSubscription.status === 'active' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <span className="text-gray-100 font-medium">Started:</span>
                  <span className="text-white font-semibold">{new Date(currentSubscription.startDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <span className="text-gray-100 font-medium">Next Billing:</span>
                  <span className="text-white font-semibold">{new Date(currentSubscription.nextBilling).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <span className="text-gray-100 font-medium">Auto Renew:</span>
                  <Badge className={`border-0 font-semibold ${
                    currentSubscription.autoRenew 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    {currentSubscription.autoRenew ? 'On' : 'Off'}
                  </Badge>
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={handleCancelSubscription}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold border-0"
                    disabled={isLoading || currentSubscription.status !== 'active'}
                  >
                    {isLoading ? 'Processing...' : 'Cancel Subscription'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Choose Your Plan</h2>
            <p className="text-gray-200">Upgrade, downgrade, or switch your subscription anytime</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 shadow-xl backdrop-blur-sm ${
                  plan.current 
                    ? 'border-purple-500 bg-purple-900/30' 
                    : plan.popular 
                    ? 'border-purple-400 bg-purple-800/20' 
                    : 'border-gray-600 bg-gray-900/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-bold transform rotate-12 translate-x-4 -translate-y-2">
                    POPULAR
                  </div>
                )}
                
                {plan.current && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 text-white border-0 font-semibold">
                      <Check className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white bg-gradient-to-r ${plan.color} mb-4 shadow-lg`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-white">
                      ${plan.price}
                      <span className="text-lg font-normal text-gray-300">/{plan.duration}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-100 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleSubscription(plan.id, plan.price)}
                    disabled={plan.current || isLoading}
                    className={`w-full py-3 font-semibold transition-all border-0 ${
                      plan.current 
                        ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                    }`}
                  >
                    {isLoading 
                      ? 'Processing...' 
                      : plan.current 
                      ? 'Current Plan' 
                      : `Upgrade to ${plan.name}`
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Usage Statistics */}
        <Card className="bg-gradient-to-r from-slate-900/50 to-gray-900/50 border-gray-600/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <TrendingUp className="w-6 h-6" />
              Your Music Stats This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <HeadphonesIcon className="w-8 h-8 text-purple-400 mx-auto" />
                <div className="text-2xl font-bold text-white">127</div>
                <div className="text-sm text-gray-300">Hours Listened</div>
              </div>
              <div className="text-center space-y-2 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Music className="w-8 h-8 text-purple-400 mx-auto" />
                <div className="text-2xl font-bold text-white">1,542</div>
                <div className="text-sm text-gray-300">Songs Played</div>
              </div>
              <div className="text-center space-y-2 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Download className="w-8 h-8 text-purple-400 mx-auto" />
                <div className="text-2xl font-bold text-white">89</div>
                <div className="text-sm text-gray-300">Downloads</div>
              </div>
              <div className="text-center space-y-2 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <Users className="w-8 h-8 text-purple-400 mx-auto" />
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm text-gray-300">Artists Supported</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-500/30 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white text-center justify-center">
              <Gift className="w-6 h-6" />
              Subscription Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">For You</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-gray-200 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Ad-free listening experience
                  </li>
                  <li className="flex items-center gap-3 text-gray-200 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <HeadphonesIcon className="w-4 h-4 text-yellow-400" />
                    Higher quality audio streams
                  </li>
                  <li className="flex items-center gap-3 text-gray-200 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <Download className="w-4 h-4 text-yellow-400" />
                    Offline listening capabilities
                  </li>
                  <li className="flex items-center gap-3 text-gray-200 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Exclusive content access
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">For Artists</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-gray-200 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Higher streaming revenues
                  </li>
                  <li className="flex items-center gap-3 text-gray-200 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <Users className="w-4 h-4 text-green-400" />
                    Direct fan support
                  </li>
                  <li className="flex items-center gap-3 text-gray-200 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <Gift className="w-4 h-4 text-green-400" />
                    Community reward pools
                  </li>
                  <li className="flex items-center gap-3 text-gray-200 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <Crown className="w-4 h-4 text-green-400" />
                    Priority platform features
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManagement;