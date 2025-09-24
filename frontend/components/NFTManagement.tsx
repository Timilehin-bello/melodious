"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Coins, Play, Pause } from "lucide-react";
import Image from "next/image";
import { Track } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { useMusicPlayer } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { NFTPreviewModal } from "@/components/Modal/NFTPreviewModal";
import { useTrackNFTs, useArtistTokens } from "@/hooks/useNFT";
import { useActiveAccount } from "thirdweb/react";

interface NFTManagementProps {
  tracks: Track[];
}

type NFTType = "ERC721" | "ERC1155";

const NFTManagement: React.FC<NFTManagementProps> = ({ tracks }) => {
  const [selectedNFTType, setSelectedNFTType] = useState<NFTType>("ERC721");
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();
  const account = useActiveAccount();

  // Get NFT data
  const { data: trackNFTs = [] } = useTrackNFTs(account?.address);
  const { data: artistTokens = [] } = useArtistTokens(account?.address);

  // Filter tracks based on selected NFT type
  const eligibleTracks = tracks.filter((track) => {
    if (selectedNFTType === "ERC721") {
      // Show tracks that don't have ERC721 NFTs
      return !trackNFTs.some((nft) => nft.trackId === track.id);
    } else {
      // Show tracks that don't have ERC1155 artist tokens
      return !artistTokens.some((token) => token.trackId === track.id);
    }
  });

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleCreateNFT = (track: Track) => {
    setSelectedTrack(track);
    setShowNFTModal(true);
  };

  const handleNFTSuccess = () => {
    setShowNFTModal(false);
    setSelectedTrack(null);
    // Optionally refresh tracks data here
  };

  return (
    <div className="space-y-6">
      {/* NFT Type Selection */}
      <div className="flex gap-4">
        <Button
          variant="default"
          onClick={() => setSelectedNFTType("ERC721")}
          className={`flex items-center gap-2 ${
            selectedNFTType === "ERC721"
              ? "bg-[#950944] text-white hover:bg-[#950944]/90"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          <Music className="w-4 h-4" />
          Track NFTs (ERC-721)
        </Button>
        <Button
          variant={selectedNFTType === "ERC1155" ? "default" : "destructive"}
          onClick={() => setSelectedNFTType("ERC1155")}
          className={`flex items-center gap-2 ${
            selectedNFTType === "ERC1155"
              ? "bg-[#950944] text-white hover:bg-[#950944]/90"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          <Coins className="w-4 h-4" />
          Artist Tokens (ERC-1155)
        </Button>
      </div>

      {/* Description */}
      <div className="bg-[#181425] rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">
          {selectedNFTType === "ERC721" ? "Track NFTs" : "Artist Tokens"}
        </h3>
        <p className="text-gray-400 text-sm">
          {selectedNFTType === "ERC721"
            ? "Create unique NFTs for individual track ownership and royalty rights."
            : "Mint fungible tokens that fans can purchase to support your music."}
        </p>
      </div>

      {/* Eligible Tracks */}
      <div className="bg-[#181425] rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-medium">
            Eligible Tracks ({eligibleTracks.length})
          </h4>
          <Badge variant="secondary" className="bg-[#950944]/20 text-[#950944]">
            {selectedNFTType === "ERC721" ? "No Track NFT" : "No Artist Tokens"}
          </Badge>
        </div>

        {eligibleTracks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              {selectedNFTType === "ERC721" ? (
                <Music className="w-8 h-8 text-zinc-500" />
              ) : (
                <Coins className="w-8 h-8 text-zinc-500" />
              )}
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-1">
              No eligible tracks
            </h3>
            <p className="text-sm text-zinc-500">
              All your tracks already have{" "}
              {selectedNFTType === "ERC721" ? "Track NFTs" : "Artist Tokens"}{" "}
              created.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {eligibleTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={
                        track.imageUrl || "/placeholder.svg?height=48&width=48"
                      }
                      alt={track.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-all duration-200 rounded-md"
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                  <div>
                    <h5 className="text-white font-medium">{track.title}</h5>
                    <p className="text-gray-400 text-sm">{track.artist}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleCreateNFT(track)}
                  className="bg-[#950944] hover:bg-[#950944]/90 text-white"
                >
                  Create {selectedNFTType === "ERC721" ? "NFT" : "Tokens"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NFT Preview Modal */}
      {showNFTModal && selectedTrack && (
        <NFTPreviewModal
          isOpen={showNFTModal}
          onClose={() => setShowNFTModal(false)}
          trackData={{
            title: selectedTrack.title,
            artist: selectedTrack.artist,
            imageUrl: selectedTrack.imageUrl,
            audioUrl: selectedTrack.audioUrl,
            trackId: selectedTrack.id,
            duration: selectedTrack.duration.toString(),
          }}
          nftType={selectedNFTType}
          onSuccess={handleNFTSuccess}
        />
      )}
    </div>
  );
};

export default NFTManagement;
