"use client";

import React from "react";
import NextImage from "next/image";
import { ArtistToken, TrackNFT } from "@/hooks/useNFT";
import { Track } from "@/hooks/useTracks";

// Helper function to build IPFS URL from hash
const buildIpfsUrl = (ipfsHash: string) => {
  if (!ipfsHash) return "/placeholder.svg?height=200&width=200";
  const pinataSubdomain =
    process.env.NEXT_PUBLIC_PINATA_SUBDOMAIN ||
    "https://chocolate-actual-weasel-471.mypinata.cloud";
  return `${pinataSubdomain}/ipfs/${ipfsHash}`;
};

// Helper function to truncate long titles
const truncateTitle = (title: string, maxLength: number = 20) => {
  if (!title) return "Untitled Track";
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + "...";
};

interface ArtistTokenCardProps {
  token: ArtistToken;
  track?: Track;
  trackNFTs?: TrackNFT[];
}

export const ArtistTokenCard: React.FC<ArtistTokenCardProps> = ({
  token,
  track,
  trackNFTs,
}) => {
  const trackTitle = track?.title || `Track ${token.trackId}`;
  // For ERC-1155 tokens, we need to get the IPFS hash from the associated track NFT
  const associatedNFT = trackNFTs?.find(
    (nft: TrackNFT) => nft.trackId === token.trackId
  );
  const ipfsHash = associatedNFT?.ipfsHash || track?.imageUrl;

  return (
    <div
      key={token.id}
      className="bg-[#2A1B3D] rounded-2xl p-4 border border-[#4A3B5D] hover:border-[#6B5B7D] transition-all duration-300 group cursor-pointer"
    >
      {/* NFT Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4">
        <NextImage
          src={
            ipfsHash && ipfsHash.startsWith("Qm")
              ? buildIpfsUrl(ipfsHash)
              : track?.imageUrl || "/placeholder.svg?height=200&width=200"
          }
          alt={trackTitle}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3">
          <div className="bg-[#6B5B7D] text-white px-2 py-1 rounded-lg text-xs font-medium">
            NFT{token.tokenId}
          </div>
        </div>
      </div>

      {/* NFT Details */}
      <div className="space-y-2">
        <h4 className="font-bold text-white text-lg" title={trackTitle}>
          {truncateTitle(trackTitle)}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-[#9B8BB5] text-sm">NFT{token.tokenId}</span>
          <span className="text-yellow-400 text-sm font-medium">
            {token.pricePerToken} CTSI
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#9B8BB5] text-sm">{token.amount}TKN</span>
        </div>
      </div>
    </div>
  );
};
