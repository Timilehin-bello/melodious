"use client";
import { Button } from "@/components/ui/button";
import React from "react";

const Wallet = () => {
  return (
    <div>
      <div className="w-full flex flex-wrap  items-center gap-8 bg-gradient-to-b from-[#3D2250] to-[#1E1632] rounded-md  px-6 py-8 sm:px-4  sm:justify-between md:justify-between justify-between text-white">
        <div className="w-2/3 h-75">
          <div className="mb-3 py-4 px-6">
            <h3 className="text-2xl">Total Revenue</h3>
            <h2 className="text-6xl mt-4">CTSI (62,340.48)</h2>
            <div className="flex gap-4 flex-wrap mt-8">
              <Button
                onClick={() => {
                  console.log("clicked transfer");
                }}
                className={`h-[45px] px-4 py-2 rounded-md text-blue-300 hover:bg-blue-500`}
              >
                Transfer
              </Button>
              <Button
                onClick={() => {
                  console.log("clicked withdraw");
                }}
                className={`h-[45px] px-4 py-2 rounded-md text-green-300 hover:bg-green-500`}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 mt-2 text-white bg-blue-950">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="mt-8 bg-[#1C1C32] flex flex-wrap gap-32 px-6 py-4 w-full h-[52px] sm:w-[500px] md:w-[726px] lg:w-[726px] xl:w-[980px] 2xl:w-[1000px] text-muted">
          <p className="lg:mr-40 md:mr-0 sm:mr-0">
            <span className="pr-4">#</span> Song Name
          </p>
          <p>Date Added</p>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
