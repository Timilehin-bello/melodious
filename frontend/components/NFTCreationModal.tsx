"use client";

import React, { useState, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Music, Coins, Loader2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Track } from "@/hooks/useTracks";
import { TrackNFT, ArtistToken } from "@/hooks/useNFT";
import toast from "react-hot-toast";

interface NFTCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tracks: Track[];
  trackNFTs: TrackNFT[];
  artistTokens: ArtistToken[];
  nftType: "ERC721" | "ERC1155";
  onMintTrackNFT: (data: {
    trackId: string;
    ipfsHash: string;
    royaltyPercentage: number;
  }) => Promise<void>;
  onMintArtistTokens: (data: {
    trackId: string;
    amount: number;
    pricePerToken: number;
  }) => Promise<void>;
  isPending: boolean;
}

type CreationStep = "selection" | "preview" | "minting" | "success";

export const NFTCreationModal: React.FC<NFTCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tracks,
  trackNFTs,
  artistTokens,
  nftType,
  onMintTrackNFT,
  onMintArtistTokens,
  isPending,
}) => {
  const [currentStep, setCurrentStep] = useState<CreationStep>("selection");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(10);
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [pricePerToken, setPricePerToken] = useState<number>(0.01);
  const [ipfsHash, setIpfsHash] = useState<string>("");

  // Filter eligible tracks based on NFT type
  const eligibleTracks = useMemo(() => {
    if (!tracks) return [];

    return tracks.filter((track) => {
      if (nftType === "ERC721") {
        // Show tracks that don't have ERC721 NFTs
        return !trackNFTs.some((nft) => Number(nft.trackId) === track.id);
      } else {
        // Show tracks that don't have ERC1155 artist tokens
        return !artistTokens.some(
          (token) => Number(token.trackId) === track.id
        );
      }
    });
  }, [tracks, trackNFTs, artistTokens, nftType]);

  // Extract IPFS hash from URL
  const extractIpfsHash = (url: string): string => {
    const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    return match ? match[1] : url;
  };

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
    // Auto-populate IPFS hash from track image URL
    if (track.imageUrl) {
      setIpfsHash(extractIpfsHash(track.imageUrl));
    }
    setCurrentStep("preview");
  };

  const handleMintNFTs = async () => {
    if (!selectedTrack) {
      toast.error("Please select a track");
      return;
    }

    try {
      setCurrentStep("minting");

      if (nftType === "ERC721") {
        if (!ipfsHash) {
          toast.error("IPFS hash is required for Track NFTs");
          setCurrentStep("preview");
          return;
        }
        await onMintTrackNFT({
          trackId: selectedTrack.id.toString(),
          ipfsHash: ipfsHash,
          royaltyPercentage: royaltyPercentage,
        });
      } else {
        await onMintArtistTokens({
          trackId: selectedTrack.id.toString(),
          amount: tokenAmount,
          pricePerToken: pricePerToken,
        });
      }

      setCurrentStep("success");
      toast.success(
        `${
          nftType === "ERC721" ? "Track NFT" : "Artist Tokens"
        } minted successfully!`
      );

      // Wait a moment then close and trigger success callback
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 5000);
    } catch (error) {
      console.error("Error minting NFTs:", error);
      setCurrentStep("preview");
      toast.error(
        `Failed to mint ${
          nftType === "ERC721" ? "Track NFT" : "Artist Tokens"
        }. Please try again.`
      );
    }
  };

  const handleClose = () => {
    if (currentStep !== "minting") {
      onClose();
      // Reset state
      setCurrentStep("selection");
      setSelectedTrack(null);
      setRoyaltyPercentage(10);
      setTokenAmount(100);
      setPricePerToken(0.01);
      setIpfsHash("");
    }
  };

  const handleBackToSelection = () => {
    setCurrentStep("selection");
    setSelectedTrack(null);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#181425] p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center mb-6"
                >
                  <h3 className="text-2xl font-semibold text-white">
                    {currentStep === "selection" &&
                      `Create ${
                        nftType === "ERC721" ? "Track NFT" : "Artist Tokens"
                      }`}
                    {currentStep === "preview" &&
                      `${
                        nftType === "ERC721" ? "Track NFT" : "Artist Tokens"
                      } Preview & Configuration`}
                    {currentStep === "minting" &&
                      `Minting ${nftType === "ERC721" ? "NFT" : "Tokens"}...`}
                    {currentStep === "success" &&
                      `${
                        nftType === "ERC721" ? "NFT" : "Tokens"
                      } Minted Successfully!`}
                  </h3>
                  {currentStep !== "minting" && (
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </Dialog.Title>

                {/* Track Selection Step */}
                {currentStep === "selection" && (
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-lg font-medium text-white mb-2">
                        {nftType === "ERC721" ? "Track NFTs" : "Artist Tokens"}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {nftType === "ERC721"
                          ? "Create unique NFTs for individual track ownership and royalty rights."
                          : "Mint fungible tokens that fans can purchase to support your music."}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-medium">
                          Eligible Tracks ({eligibleTracks.length})
                        </h4>
                        <Badge
                          variant="secondary"
                          className="bg-[#950944]/20 text-[#950944]"
                        >
                          {nftType === "ERC721"
                            ? "No Track NFT"
                            : "No Artist Tokens"}
                        </Badge>
                      </div>

                      {eligibleTracks.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                            {nftType === "ERC721" ? (
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
                            {nftType === "ERC721"
                              ? "Track NFTs"
                              : "Artist Tokens"}{" "}
                            created.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {eligibleTracks.map((track) => (
                            <div
                              key={track.id}
                              className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
                              onClick={() => handleTrackSelect(track)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12">
                                  <Image
                                    src={
                                      track.imageUrl ||
                                      "/placeholder.svg?height=48&width=48"
                                    }
                                    alt={track.title}
                                    fill
                                    className="object-cover rounded-md"
                                  />
                                </div>
                                <div>
                                  <h5 className="text-white font-medium">
                                    {track.title}
                                  </h5>
                                  <p className="text-gray-400 text-sm">
                                    Track ID: {track.id}
                                  </p>
                                </div>
                              </div>
                              <Button
                                className="bg-[#950944] hover:bg-[#950944]/90 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTrackSelect(track);
                                }}
                              >
                                Select Track
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview & Configuration Step */}
                {currentStep === "preview" && selectedTrack && (
                  <div className="space-y-6">
                    {/* Track Preview */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-lg font-medium text-white mb-4">
                        Track Preview
                      </h4>
                      <div className="flex gap-4">
                        <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              selectedTrack.imageUrl ||
                              "/placeholder.svg?height=96&width=96"
                            }
                            alt={selectedTrack.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-medium text-lg">
                            {selectedTrack.title}
                          </h5>
                          <p className="text-gray-400 text-sm mb-2">
                            Track ID: {selectedTrack.id}
                          </p>
                          {selectedTrack.duration && (
                            <p className="text-gray-400 text-sm">
                              Duration: {selectedTrack.duration}s
                            </p>
                          )}
                          <div className="mt-2">
                            <audio controls className="w-full max-w-md">
                              <source src={selectedTrack.audioUrl} />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NFT Configuration */}
                    <div className="flex justify-center">
                      {nftType === "ERC721" ? (
                        /* Track NFT (ERC-721) */
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10 w-full">
                          <div className="flex items-center gap-2 mb-4 justify-center">
                            <Music className="w-5 h-5 text-[#950944]" />
                            <h4 className="text-lg font-medium text-white">
                              Track NFT (ERC-721)
                            </h4>
                          </div>
                          <div className="space-y-4">
                            <div className="w-24 h-24 relative rounded-lg overflow-hidden mx-auto">
                              <Image
                                src={
                                  selectedTrack.imageUrl ||
                                  "/placeholder.svg?height=96&width=96"
                                }
                                alt="Track NFT"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-sm">
                                IPFS Hash
                              </Label>
                              <Input
                                type="text"
                                value={ipfsHash}
                                onChange={(e) => setIpfsHash(e.target.value)}
                                placeholder="QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                className="bg-white/5 border-white/10 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-sm">
                                Royalty Percentage
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={royaltyPercentage}
                                onChange={(e) =>
                                  setRoyaltyPercentage(Number(e.target.value))
                                }
                                className="bg-white/5 border-white/10 text-white mt-1"
                              />
                            </div>
                            <div className="text-xs text-gray-400 text-center">
                              <p>• Unique ownership certificate</p>
                              <p>• Royalties on secondary sales</p>
                              <p>• Transferable asset</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Artist Tokens (ERC-1155) */
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10 max-w-md w-full">
                          <div className="flex items-center gap-2 mb-4 justify-center">
                            <Coins className="w-5 h-5 text-[#950944]" />
                            <h4 className="text-lg font-medium text-white">
                              Artist Tokens (ERC-1155)
                            </h4>
                          </div>
                          <div className="space-y-4">
                            <div className="w-24 h-24 relative rounded-lg overflow-hidden mx-auto bg-gradient-to-br from-[#950944] to-purple-600 flex items-center justify-center">
                              <Coins className="w-10 h-10 text-white" />
                            </div>
                            <div>
                              <Label className="text-white text-sm">
                                Token Amount
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                value={tokenAmount}
                                onChange={(e) =>
                                  setTokenAmount(Number(e.target.value))
                                }
                                className="bg-white/5 border-white/10 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-sm">
                                Price per Token (CTSI)
                              </Label>
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={pricePerToken}
                                onChange={(e) =>
                                  setPricePerToken(Number(e.target.value))
                                }
                                className="bg-white/5 border-white/10 text-white mt-1"
                              />
                            </div>
                            <div className="text-xs text-gray-400 text-center">
                              <p>• Fractional ownership</p>
                              <p>• Fan investment opportunity</p>
                              <p>• Revenue sharing potential</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        onClick={handleBackToSelection}
                        className="flex-1 bg-white/10 text-white hover:bg-white/20"
                      >
                        Back to Selection
                      </Button>
                      <Button
                        onClick={handleMintNFTs}
                        className="flex-1 bg-[#950944] text-white hover:bg-[#950944]/90"
                        disabled={isPending}
                      >
                        {nftType === "ERC721" ? "Mint NFT" : "Mint Tokens"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Minting Step */}
                {currentStep === "minting" && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-[#950944] animate-spin mb-4" />
                    <h4 className="text-xl font-medium text-white mb-2">
                      Minting Your{" "}
                      {nftType === "ERC721" ? "Track NFT" : "Artist Tokens"}...
                    </h4>
                    <p className="text-gray-400 text-center max-w-md">
                      Please wait while we mint your{" "}
                      {nftType === "ERC721" ? "Track NFT" : "Artist Tokens"}.
                      This may take a few moments.
                    </p>
                  </div>
                )}

                {/* Success Step */}
                {currentStep === "success" && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-medium text-white mb-2">
                      {nftType === "ERC721" ? "Track NFT" : "Artist Tokens"}{" "}
                      Minted Successfully!
                    </h4>
                    <p className="text-gray-400 text-center max-w-md">
                      Your{" "}
                      {nftType === "ERC721"
                        ? "Track NFT has"
                        : "Artist Tokens have"}{" "}
                      been created. Redirecting you to your collection...
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NFTCreationModal;
