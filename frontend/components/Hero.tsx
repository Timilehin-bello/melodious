"use client";
import React from "react";
import Image from "next/image";
import ConnectWallet from "./ConnectWallet";
import Link from "next/link";
import { AlignJustify, X, Music, Users, Sparkles } from "lucide-react";

const Hero = () => {
  const [isMobileNavActive, setIsMobileNavActive] = React.useState(false);

  return (
    <section id="home" className="bg-[url('/images/landing/background1.svg')] bg-cover bg-center min-h-screen relative overflow-hidden">
      {/* Navigation Bar */}
      <div className="relative z-20 px-6 md:px-10 lg:px-16 py-6">
        <div className="flex items-center justify-between">
          <Image
            src="/images/melodious_full_logo.svg"
            width={250}
            height={65}
            alt="melodious logo"
            className="w-40 md:w-52 lg:w-64 h-auto"
          />
          <div className="hidden md:flex md:items-center md:gap-8">
            <nav className="space-x-8 lg:space-x-12 text-white text-base lg:text-lg">
              <Link href="#home" className="hover:text-purple-300 transition-colors">Home</Link>
              <Link href="#about" className="hover:text-purple-300 transition-colors">About Us</Link>
              <Link href="#pricing" className="hover:text-purple-300 transition-colors">Pricing</Link>
              <Link href="#how-it-works" className="hover:text-purple-300 transition-colors">How It Works</Link>
            </nav>
            <ConnectWallet />
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMobileNavActive(!isMobileNavActive)}
          >
            {isMobileNavActive ? (
              <X size={28} className="text-white" />
            ) : (
              <AlignJustify size={28} className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileNavActive && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col gap-8 justify-center items-center bg-gradient-to-b from-purple-950 to-black">
          <button
            className="absolute top-6 right-6"
            onClick={() => setIsMobileNavActive(!isMobileNavActive)}
          >
            <X size={28} className="text-white" />
          </button>
          <nav className="text-white flex flex-col gap-6 text-xl text-center">
            <Link href="#home" onClick={() => setIsMobileNavActive(!isMobileNavActive)} className="hover:text-purple-300 transition-colors">
              Home
            </Link>
            <Link href="#about" onClick={() => setIsMobileNavActive(!isMobileNavActive)} className="hover:text-purple-300 transition-colors">
              About Us
            </Link>
            <Link href="#pricing" onClick={() => setIsMobileNavActive(!isMobileNavActive)} className="hover:text-purple-300 transition-colors">
              Pricing
            </Link>
            <Link href="#how-it-works" onClick={() => setIsMobileNavActive(!isMobileNavActive)} className="hover:text-purple-300 transition-colors">
              How It Works
            </Link>
          </nav>
          <ConnectWallet />
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* Left Side - Text Content */}
          <div className="w-full lg:w-1/2 xl:w-5/12 text-white">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-900 bg-opacity-50 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-sm text-purple-200">Web3 Music Platform</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl mb-6 leading-tight">
                Support Your
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Favourite Artists</span> and Earn Rewards Together
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-10 leading-relaxed">
                Stream music, grow with artists, and earn through referrals and community support on the decentralized music platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                  Start Listening
                </button>
                <button className="px-8 py-4 bg-transparent border-2 border-purple-400 rounded-full text-white font-semibold text-lg hover:bg-purple-900 hover:bg-opacity-30 transition-all">
                  Become an Artist
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <h2 className="font-bold text-2xl md:text-3xl">432k+</h2>
                  </div>
                  <p className="text-sm md:text-base text-gray-300">Active Listeners</p>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    <h2 className="font-bold text-2xl md:text-3xl">8.5k+</h2>
                  </div>
                  <p className="text-sm md:text-base text-gray-300">Verified Artists</p>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h2 className="font-bold text-2xl md:text-3xl">$2.5M+</h2>
                  </div>
                  <p className="text-sm md:text-base text-gray-300">Rewards Earned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Hero Image */}
          <div className="w-full lg:w-1/2 xl:w-7/12 relative">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-pink-500 rounded-full blur-3xl opacity-20"></div>
              
              <Image
                src="/images/landing/hero_image.svg"
                width={800}
                height={750}
                alt="hero image"
                className="w-full h-auto relative z-10"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-400 rounded-full blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-indigo-400 rounded-full blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
    </section>
  );
};

export default Hero;