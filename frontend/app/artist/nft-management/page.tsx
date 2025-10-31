"use client";

import React, { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Tab } from "@headlessui/react";
import {
  Loader2,
  Plus,
  Music,
  Coins,
  Palette,
  RefreshCw,
  Wallet as WalletIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  useMyNFTData,
  useMintTrackNFT,
  useMintArtistTokens,
  TrackNFT,
  ArtistToken,
} from "@/hooks/useNFT";
import { useTracksByArtistWallet, Track } from "@/hooks/useTracks";

import { cn } from "@/lib/utils";
import NFTStatsCards from "@/components/NFTStatsCards";
import { NFTCreationModal } from "@/components/NFTCreationModal";
import { TrackNFTCard } from "@/components/TrackNFTCard";
import { ArtistTokenCard } from "@/components/ArtistTokenCard";

interface MintTrackNFTFormData {
  trackId: string;
  ipfsHash: string;
  royaltyPercentage: number;
}

interface MintArtistTokensFormData {
  trackId: string;
  amount: number;
  pricePerToken: number;
}

const NFTManagementPage = () => {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;

  // Use the new hook to get tracks filtered by artist wallet with artist details
  const {
    tracks,
    isLoading: tracksLoading,
    artistUser,
  } = useTracksByArtistWallet(walletAddress);

  const { trackNFTs, artistTokens, nftStats, isLoading, refetch } =
    useMyNFTData();

  const mintTrackNFTMutation = useMintTrackNFT();
  const mintArtistTokensMutation = useMintArtistTokens();

  const [showNFTCreationModal, setShowNFTCreationModal] = useState(false);
  const [selectedNFTType, setSelectedNFTType] = useState<"ERC721" | "ERC1155">(
    "ERC721"
  );

  const handleMintTrackNFT = async (data: {
    trackId: string;
    ipfsHash: string;
    royaltyPercentage: number;
  }) => {
    await mintTrackNFTMutation.mutateAsync(data);
  };

  const handleMintArtistTokens = async (data: {
    trackId: string;
    amount: number;
    pricePerToken: number;
  }) => {
    await mintArtistTokensMutation.mutateAsync(data);
  };

  const handleOpenNFTCreation = (nftType: "ERC721" | "ERC1155") => {
    setSelectedNFTType(nftType);
    setShowNFTCreationModal(true);
  };

  const handleNFTCreationSuccess = () => {
    refetch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} CTSI`;
  };

  if (!activeAccount) {
    return (
      <div className="min-h-screen  bg-gradient-to-br from-[#3D2250] to-[#1E1632] text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm text-center max-w-md mx-auto">
            <WalletIcon className="w-16 h-16 mx-auto mb-4 text-[#950844]" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Wallet Not Connected
            </h2>
            <p className="text-zinc-400 mb-6">
              Please connect your wallet to manage your NFTs and access the full
              features of the platform.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
              <AlertCircle className="w-4 h-4" />
              <span>Web3 wallet required</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D2250] to-[#1E1632] text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Gradient Banner */}
        <div className="mb-8 w-full">
          <div className="bg-zinc-900/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#950844] to-[#1C1C32] mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center p-6 sm:p-8">
                <div className="z-10 space-y-4 text-center sm:text-left mb-6 sm:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Palette className="w-8 h-8 text-white" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                      NFT Studio
                    </h1>
                  </div>
                  <p className="text-white/80 text-lg">
                    Create and manage your digital music assets
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      <span>Track NFTs (ERC-721)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      <span>Artist Tokens (ERC-1155)</span>
                    </div>
                  </div>
                </div>
                <div className="relative w-full sm:w-auto h-[120px] sm:h-auto">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Palette className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">
                  Wallet Connected: {activeAccount.address?.slice(0, 6)}...
                  {activeAccount.address?.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <NFTStatsCards nftStats={nftStats} formatPrice={formatPrice} />

        {/* Main Content */}
        <div className="bg-zinc-900/30 rounded-xl backdrop-blur-sm border border-zinc-800/50 mb-8">
          <Tab.Group>
            <div className="border-b border-zinc-800/50">
              <Tab.List className="flex">
                <Tab
                  className={({ selected }) =>
                    cn(
                      "px-6 py-4 text-sm font-medium outline-none",
                      "flex items-center gap-2 transition-all duration-200",
                      selected
                        ? "text-[#950844] border-b-2 border-[#950844]"
                        : "text-zinc-400 hover:text-zinc-300"
                    )
                  }
                >
                  <Music className="w-4 h-4" />
                  Track NFTs (ERC-721)
                </Tab>
                <Tab
                  className={({ selected }) =>
                    cn(
                      "px-6 py-4 text-sm font-medium outline-none",
                      "flex items-center gap-2 transition-all duration-200",
                      selected
                        ? "text-[#950844] border-b-2 border-[#950844]"
                        : "text-zinc-400 hover:text-zinc-300"
                    )
                  }
                >
                  <Coins className="w-4 h-4" />
                  Artist Tokens (ERC-1155)
                </Tab>
              </Tab.List>
            </div>

            <Tab.Panels className="p-6">
              {/* ERC-721 Tab */}
              <Tab.Panel className={cn("focus:outline-none space-y-8")}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Track NFTs
                    </h3>
                    <p className="text-zinc-400">
                      Unique NFTs representing ownership of individual tracks
                    </p>
                  </div>
                  <Button
                    onClick={() => handleOpenNFTCreation("ERC721")}
                    className="bg-gradient-to-r from-[#950844] to-[#7a0635] hover:from-[#7a0635] hover:to-[#950844] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Track NFT
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#950844]" />
                  </div>
                ) : trackNFTs && trackNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trackNFTs.map((nft: TrackNFT) => {
                      const track = tracks?.find(
                        (t: Track) => t.id === Number(nft.trackId)
                      );
                      console.log("Track found:", tracks);
                      return (
                        <TrackNFTCard key={nft.id} nft={nft} track={track} />
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 rounded-2xl p-12 text-center backdrop-blur-sm border border-zinc-800/50">
                    <div className="bg-zinc-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Music className="h-10 w-10 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      No Track NFTs Yet
                    </h3>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                      Create your first Track NFT to start building your digital
                      music collection
                    </p>
                    <Button
                      onClick={() => handleOpenNFTCreation("ERC721")}
                      className="bg-gradient-to-r from-[#950844] to-[#7a0635] hover:from-[#7a0635] hover:to-[#950844] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Mint Your First Track NFT
                    </Button>
                  </div>
                )}
              </Tab.Panel>

              {/* ERC-1155 Tab */}
              <Tab.Panel className={cn("focus:outline-none space-y-8")}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Artist Tokens
                    </h3>
                    <p className="text-zinc-400">
                      Fungible tokens representing shares in your music
                    </p>
                  </div>
                  <Button
                    onClick={() => handleOpenNFTCreation("ERC1155")}
                    className="bg-gradient-to-r from-[#950844] to-[#7a0635] hover:from-[#7a0635] hover:to-[#950844] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Artist Tokens
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  </div>
                ) : artistTokens && artistTokens.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {artistTokens.map((token: ArtistToken) => {
                      const track = tracks?.find(
                        (t: Track) => t.id === Number(token.trackId)
                      );
                      return (
                        <ArtistTokenCard
                          key={token.id}
                          token={token}
                          track={track}
                          trackNFTs={trackNFTs}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 rounded-2xl p-12 text-center backdrop-blur-sm border border-zinc-800/50">
                    <div className="bg-zinc-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Coins className="h-10 w-10 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      No Artist Tokens Yet
                    </h3>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                      Create your first Artist Tokens to start building your
                      music economy
                    </p>
                    <Button
                      onClick={() => handleOpenNFTCreation("ERC1155")}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Mint Your First Artist Tokens
                    </Button>
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* NFT Creation Modal */}
        <NFTCreationModal
          isOpen={showNFTCreationModal}
          onClose={() => setShowNFTCreationModal(false)}
          onSuccess={handleNFTCreationSuccess}
          tracks={tracks}
          trackNFTs={trackNFTs || []}
          artistTokens={artistTokens || []}
          nftType={selectedNFTType}
          onMintTrackNFT={handleMintTrackNFT}
          onMintArtistTokens={handleMintArtistTokens}
          isPending={
            mintTrackNFTMutation.isPending || mintArtistTokensMutation.isPending
          }
        />
      </div>
    </div>
  );
};

export default NFTManagementPage;
