"use client";

import React from "react";
import { Music, Coins, TrendingUp } from "lucide-react";

interface NFTStats {
  totalTrackNFTs: number;
  totalArtistTokens: number;
  totalTokensSold: number;
  totalRevenue: number;
}

interface NFTStatsCardsProps {
  nftStats: NFTStats | undefined;
  formatPrice: (price: number) => string;
}

const NFTStatsCards: React.FC<NFTStatsCardsProps> = ({
  nftStats,
  formatPrice,
}) => {
  if (!nftStats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm border border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">Track NFTs</p>
            <p className="text-2xl font-bold text-white">
              {nftStats.totalTrackNFTs}
            </p>
          </div>
          <div className="p-3 bg-[#950844]/20 rounded-full">
            <Music className="h-6 w-6 text-[#950844]" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm border border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">
              Artist Tokens
            </p>
            <p className="text-2xl font-bold text-white">
              {nftStats.totalArtistTokens}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-full">
            <Coins className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm border border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">
              Tokens Sold
            </p>
            <p className="text-2xl font-bold text-white">
              {nftStats.totalTokensSold}
            </p>
          </div>
          <div className="p-3 bg-blue-500/20 rounded-full">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm border border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-white">
              {formatPrice(nftStats.totalRevenue)}
            </p>
          </div>
          <div className="p-3 bg-yellow-500/20 rounded-full">
            <TrendingUp className="h-6 w-6 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTStatsCards;
