"use client";
import React from "react";
import { Button } from "./ui/button";
import { useMelodiousContext } from "@/contexts/melodious";
import toast from "react-hot-toast";
import { addInput } from "@/cartesi/Portals";

const Subscription = () => {
  const { rollups, dappAddress } = useMelodiousContext();

  const handleSubscription = async (plan: string, amount: number) => {
    const jsonPayload = JSON.stringify({
      method: "subscribe",
      args: {
        plan,
        amount,
      },
    });
    let processingToastId: string | undefined; // Declare processingToastId at the function scope
    try {
      processingToastId = toast.loading("Processing subscription request...");

      const result = await addInput(rollups, jsonPayload, dappAddress);

      // Check if the result is a valid transaction receipt
      if (result && typeof result === 'object' && 'transactionHash' in result && result.transactionHash) {
        toast.success("Subscription request sent successfully! Your subscription is being processed.", { id: processingToastId });
      } else {
        // If result is not a valid receipt (e.g., it's an error object or null/undefined)
        toast.error("Failed to send subscription request. Please try again.", { id: processingToastId });
      }
    } catch (error) {
      console.error("Error during subscription:", error);
      // Ensure toast is updated even if an error occurs before assignment or if toast.loading itself failed
      if (processingToastId) {
        toast.error("An error occurred while processing your subscription.", { id: processingToastId });
      } else {
        // Fallback if processingToastId was never assigned (e.g., toast.loading failed)
        toast.error("An error occurred while processing your subscription.");
      }
    }
  };

  return (
    <section className="bg-[url('/images/landing/background2.svg')] bg-cover bg-center text-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
<div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center flex flex-col justify-between h-full">
  <h3 className="text-2xl font-bold mb-4">Free</h3>
  <p className="text-5xl font-bold mb-6">$0</p>
  <ul className="text-left mb-4 space-y-2">
              <li>✔️ Access to limited music library</li>
              <li>✔️ Ad-supported listening</li>
              <li>✔️ Standard audio quality</li>
            </ul>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSubscription("free", 0)}
            >
              Get Started
            </Button>
          </div>
<div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center flex flex-col justify-between h-full">
  <h3 className="text-2xl font-bold mb-4">Bronze</h3>
  <p className="text-5xl font-bold mb-6">$4.99</p>
  <ul className="text-left mb-4 space-y-2">
              <li>✔️ Ad-free listening</li>
              <li>✔️ Access to full music library</li>
              <li>✔️ Standard audio quality</li>
            </ul>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSubscription("bronze", 4.99)}
            >
              Subscribe Now
            </Button>
          </div>
<div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center flex flex-col justify-between h-full">
  <h3 className="text-2xl font-bold mb-4">Silver</h3>
  <p className="text-5xl font-bold mb-6">$9.99</p>
  <ul className="text-left mb-4 space-y-2">
              <li>✔️ All Bronze features</li>
              <li>✔️ High-fidelity audio</li>
              <li>✔️ Offline downloads</li>
            </ul>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSubscription("silver", 9.99)}
            >
              Subscribe Now
            </Button>
          </div>
<div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center flex flex-col justify-between h-full">
  <h3 className="text-2xl font-bold mb-4">Gold</h3>
  <p className="text-5xl font-bold mb-6">$14.99</p>
  <ul className="text-left mb-4 space-y-2">
              <li>✔️ All Silver features</li>
              <li>✔️ Access to exclusive content</li>
              <li>✔️ Early access to new releases</li>
            </ul>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSubscription("gold", 14.99)}
            >
              Subscribe Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subscription;
