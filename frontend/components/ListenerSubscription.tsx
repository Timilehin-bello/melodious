"use client";
import React from "react";
import { Button } from "./ui/button";
import { useMelodiousContext } from "@/contexts/melodious";
import toast from "react-hot-toast";
import { addInput } from "@/cartesi/Portals";

const ListenerSubscription = () => {
  const { rollups, dappAddress } = useMelodiousContext();

  const handleSubscription = async (plan: string, amount: number) => {
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
        toast.success("Subscription request sent successfully! Your subscription is being processed.", { id: processingToastId });
      } else {
        toast.error("Failed to send subscription request. Please try again.", { id: processingToastId });
      }
    } catch (error) {
      console.error("Error during subscription:", error);
      if (processingToastId) {
        toast.error("An error occurred while processing your subscription.", { id: processingToastId });
      } else {
        toast.error("An error occurred while processing your subscription.");
      }
    }
  };

  return (
    <section id="pricing" className="bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 text-white py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6">
          Listener Subscription Plans
        </h2>
        <p className="text-lg md:text-xl text-center mb-8 md:mb-12 text-gray-200 max-w-2xl mx-auto">
          Unlock unlimited music streaming with our listener-focused plans
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center flex flex-col justify-between h-full">
            <div>
              <h3 className="text-2xl font-bold mb-4">Basic Listener</h3>
              <p className="text-5xl font-bold mb-6">$2.99<span className="text-lg">/month</span></p>
              <ul className="text-left mb-6 space-y-2">
                <li>✔️ Ad-free music streaming</li>
                <li>✔️ Access to full music library</li>
                <li>✔️ Standard audio quality (320kbps)</li>
                <li>✔️ Create up to 10 playlists</li>
                <li>✔️ Mobile & desktop apps</li>
              </ul>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
              onClick={() => handleSubscription("basic_listener", 2.99)}
            >
              Start Listening
            </Button>
          </div>

          <div className="bg-gradient-to-b from-purple-600 to-purple-800 rounded-lg p-8 text-center flex flex-col justify-between h-full relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Premium Listener</h3>
              <p className="text-5xl font-bold mb-6">$6.99<span className="text-lg">/month</span></p>
              <ul className="text-left mb-6 space-y-2">
                <li>✔️ Everything in Basic</li>
                <li>✔️ High-fidelity audio (Hi-Res)</li>
                <li>✔️ Offline downloads</li>
                <li>✔️ Unlimited playlists</li>
                <li>✔️ Early access to new releases</li>
                <li>✔️ Exclusive listener events</li>
                <li>✔️ Advanced music discovery</li>
              </ul>
            </div>
            <Button
              className="bg-white text-purple-700 hover:bg-gray-100 font-semibold py-3"
              onClick={() => handleSubscription("premium_listener", 6.99)}
            >
              Go Premium
            </Button>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center flex flex-col justify-between h-full">
            <div>
              <h3 className="text-2xl font-bold mb-4">Audiophile</h3>
              <p className="text-5xl font-bold mb-6">$12.99<span className="text-lg">/month</span></p>
              <ul className="text-left mb-6 space-y-2">
                <li>✔️ Everything in Premium</li>
                <li>✔️ Lossless audio (FLAC)</li>
                <li>✔️ Spatial audio support</li>
                <li>✔️ Exclusive unreleased tracks</li>
                <li>✔️ Direct artist support features</li>
                <li>✔️ Premium customer support</li>
                <li>✔️ Concert ticket pre-sales</li>
              </ul>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
              onClick={() => handleSubscription("audiophile", 12.99)}
            >
              Experience Premium
            </Button>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-300 mb-4">
            All plans include 30-day money-back guarantee
          </p>
          <p className="text-sm text-gray-400">
            Cancel anytime. No commitment required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ListenerSubscription;