"use client";
import ConnectButtonAuth from "@/components/ConnectButtonAuth";
import ConnectWallet from "@/components/ConnectWallet";
import { AlignJustify, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useState } from "react";

export default function Home() {
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);

  return (
    <>
      <section className="bg-[url('/images/landing/background1.svg')] bg-cover bg-center h-[700px] px-10 py-6">
        <div className="flex items-center justify-between flex-wrap">
          <Image
            src="/images/melodious_full_logo.svg"
            width={250}
            height={65}
            alt="melodious logo"
            className="p-0 m-0"
          />
          <div className="hidden md:flex md:items-center md:gap-8 flex-wrap z-10">
            <nav className="space-x-14 text-white">
              <Link href="">Home</Link>
              <Link href="">About Us</Link>
              <Link href="">Pricing</Link>
              <Link href="">FAQs</Link>
              <Link href="">FAQs</Link>
            </nav>
            {/* <button className="bg-[#950944] text-white px-6 py-3 rounded-lg">
              Connect Wallet
            </button> */}
            <ConnectWallet />
          </div>

          <button
            className="md:hidden "
            onClick={() => setIsMobileNavActive(!isMobileNavActive)}
          >
            {isMobileNavActive ? (
              <AlignJustify size={26} className="text-white" />
            ) : (
              <AlignJustify size={26} className="text-white" />
            )}
          </button>

          {isMobileNavActive && (
            <div className="md:hidden flex flex-col gap-8 justify-center items-center absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-purple-950 to-black md:gap-8 flex-wrap">
              <button
                className="md:hidden absolute top-0 right-0"
                onClick={() => setIsMobileNavActive(!isMobileNavActive)}
              >
                <X size={26} className="text-white" />
              </button>
              <nav className="text-white flex flex-col gap-8">
                <Link
                  href=""
                  onClick={() => setIsMobileNavActive(!isMobileNavActive)}
                >
                  Home
                </Link>
                <Link
                  href=""
                  onClick={() => setIsMobileNavActive(!isMobileNavActive)}
                >
                  About Us
                </Link>
                <Link
                  href=""
                  onClick={() => setIsMobileNavActive(!isMobileNavActive)}
                >
                  Pricing
                </Link>
                <Link
                  href=""
                  onClick={() => setIsMobileNavActive(!isMobileNavActive)}
                >
                  FAQs
                </Link>
                <Link
                  href=""
                  onClick={() => setIsMobileNavActive(!isMobileNavActive)}
                >
                  FAQs
                </Link>
              </nav>

              {/* <button className="bg-[#950944] text-white px-6 py-3 rounded-lg">
                Connect Wallet
              </button> */}
              <ConnectWallet />
            </div>
          )}
        </div>
        <div className="mt-40 md:mt-[-70px] flex flex-wrap w-full items-center justify-center text-white px-4">
          <div className="w-full md:w-1/3">
            <div className="px-0 md:px-16 mt-[-80px]">
              <h1 className="font-bold text-4xl mb-10 w-full md:w-[370px] text- leading-normal">
                support your favourite artists and earn rewards together
              </h1>
              <p className="mb-10 w-[350px] text-gray-400">
                "Stream music, grow with artists, and earn through referrals and
                community support."
              </p>

              <div className="flex gap-8">
                <div>
                  <h2 className="font-bold text-xl">432k+</h2>
                  <p className="text-sm text-gray-400">Listener</p>
                </div>
                <div>
                  <h2 className="font-bold text-xl">432k+</h2>
                  <p className="text-sm text-gray-400">Artist</p>
                </div>
                <div>
                  <h2 className="font-bold text-xl">432k+</h2>
                  <p className="text-sm text-gray-400">Community</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-2/3">
            <Image
              src="/images/landing/hero_image.svg"
              width={780}
              height={726}
              alt="hero image"
              className="hidden md:block"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-center bg-[url('/images/landing/background2.svg')] bg-cover bg-center h-[410px] px-12 py-6">
        <div className="w-full md:w-1/3">
          <Image
            src="/images/landing/about_melodious.svg"
            width={784}
            height={750}
            alt="hero image"
          />
        </div>
        <div className="md:w-2/3 text-white mt-[-60px]">
          <h2 className="text-xl md:text-4xl font-bold mb-4 pl-20">
            About Melodious
          </h2>
          <p className="leading-normal  md:w-[650px] pl-20">
            Melodious aims to capture the unique value proposition of a music
            streaming platform where artists earn based on listener playtime,
            while listeners earn through referrals and by supporting artists via
            a community rewards pool. This page will attract both listeners and
            artists, guiding each through their respective journeys, with CTAs
            at each step to ensure seamless navigation and comprehension of the
            benefits Melodious offers.
          </p>
        </div>
      </section>
    </>
  );
}
