"use client";
import React from "react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center max-w-6xl mx-auto">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 md:p-8 hover:bg-opacity-70 transition-all duration-300">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-4">Connect Your Wallet</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Connect your favorite wallet to start streaming music and
              supporting artists securely.
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 md:p-8 hover:bg-opacity-70 transition-all duration-300">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-4">Subscribe to a Plan</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Choose a subscription plan that fits your needs to unlock
              exclusive features and premium content.
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 md:p-8 hover:bg-opacity-70 transition-all duration-300">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-4">Earn Rewards</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Earn rewards by streaming music, referring friends, and
              supporting your favorite artists in our community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
