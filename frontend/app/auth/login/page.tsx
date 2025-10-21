"use client";
import ConnectButtonAuth from "@/components/ConnectButtonAuth";
import ConnectWallet from "@/components/ConnectWallet";
import Image from "next/image";
import React, { useEffect } from "react";

const Login = () => {
  useEffect(() => {
    localStorage.clear();
  }, []);
  return (
    <div>
      <div className="w-screen flex flex-col min-h-screen bg-black text-slate-100">
        <div className="flex-1 max-w-7xl mx-auto p-4 flex items-start justify-center py-18">
          <div className="mx-auto w-full flex items-center flex-col">
            <div className="text-slate-100 mb-12 mt-12 text-center font-bold text-5xl">
              Melodious Music Platform
            </div>

            <div className="relative">
              <div className="z-10 h-full flex flex-col relative items-center justify-start max-w-sm p-12 rounded-xl bg-black/75 border-slate-800 border-2">
                <Image
                  src="/images/melodious_logo.svg"
                  alt="Thirdweb"
                  className="w-56 h-auto mb-12"
                />
                {/* <ConnectButtonAuth /> */}
                <ConnectWallet />
                <div className="text-center text-slate-600 font-semibold mt-6">
                  <p>Music at its best</p>
                </div>
              </div>
              <div className="absolute inset-0 z-0 tw-gradient blur-[50px] opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
