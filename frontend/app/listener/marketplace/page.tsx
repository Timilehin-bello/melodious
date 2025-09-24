"use client";

import React, { useState, useMemo } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ShoppingCart,
  Music,
  Search,
  Filter,
  Coins,
  Play,
  Pause,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMarketplace, usePurchaseArtistTokens } from "@/hooks/useNFT";
import { useMusicPlayer } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import toast from "react-hot-toast";

interface ArtistTokenWithDetails {
  id: number;
  owner: string;
  trackId: string;
  amount: number;
  pricePerToken: number;
  mintedAt: number;
  isActive: boolean;
  tokenId?: number;
  track?: {
    id: number;
    title: string;
    artist: {
      id: number;
      displayName?: string;
      name?: string;
      walletAddress?: string;
      username?: string;
    };
    artistId: number;
    coverArt: string;
    duration: number;
    audioUrl: string;
    lyrics?: string;
    isrcCode?: string;
    genreId?: number;
    isPublished?: boolean;
    albumId?: number;
    trackNumber?: number;
    playLists?: any[];
    createdAt?: string;
    updatedAt?: string;
  };
  artist?: {
    displayName: string;
    username: string;
    walletAddress: string;
  };
}

const NFTMarketplace = () => {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [purchaseAmounts, setPurchaseAmounts] = useState<{
    [key: number]: string;
  }>({});
  const [purchasingTokens, setPurchasingTokens] = useState<Set<number>>(
    new Set()
  );

  // Fetch marketplace data
  const { data: marketplaceData, isLoading } = useMarketplace();
  const purchaseTokensMutation = usePurchaseArtistTokens();

  // Music player
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();

  // Get enriched tokens from marketplace data
  const enrichedTokens: ArtistTokenWithDetails[] = useMemo(() => {
    return marketplaceData?.enrichedTokens || [];
  }, [marketplaceData?.enrichedTokens]);

  // Filter tokens based on search and filters
  const filteredTokens = useMemo(() => {
    let filtered = enrichedTokens;

    console.log("filtered token", enrichedTokens);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (token) =>
          token.track?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          token.artist?.displayName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          token.artist?.username
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Artist filter
    if (selectedArtist) {
      filtered = filtered.filter(
        (token) => token.owner?.toLowerCase() === selectedArtist.toLowerCase()
      );
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(
        (token) => token.pricePerToken >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max) {
      filtered = filtered.filter(
        (token) => token.pricePerToken <= parseFloat(priceRange.max)
      );
    }

    return filtered;
  }, [enrichedTokens, searchQuery, selectedArtist, priceRange]);

  // Get unique artists for filter dropdown
  const uniqueArtists = useMemo(() => {
    const artistsMap = new Map();
    enrichedTokens.forEach((token) => {
      if (token.artist) {
        artistsMap.set(token.owner, token.artist);
      }
    });
    return Array.from(artistsMap.values());
  }, [enrichedTokens]);

  // Handle purchase amount change
  const handleAmountChange = (tokenId: number, amount: string) => {
    setPurchaseAmounts((prev) => ({
      ...prev,
      [tokenId]: amount,
    }));
  };

  // Handle purchase
  const handlePurchase = async (token: ArtistTokenWithDetails) => {
    if (!walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    const amountStr = purchaseAmounts[token.id] || "1";
    const amount = parseInt(amountStr) || 1;
    if (amount > token.amount || amount < 1) {
      toast.error("Invalid amount or not enough tokens available");
      return;
    }

    // Set loading state for this specific token
    setPurchasingTokens((prev) => new Set(prev).add(token.id));

    try {
      const totalPrice = token.pricePerToken * amount;
      await purchaseTokensMutation.mutateAsync({
        tokenId: token.tokenId || token.id,
        amount,
        totalPrice,
      });

      // Reset purchase amount
      setPurchaseAmounts((prev) => ({
        ...prev,
        [token.id]: "1",
      }));
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      // Remove loading state for this specific token
      setPurchasingTokens((prev) => {
        const newSet = new Set(prev);
        newSet.delete(token.id);
        return newSet;
      });
    }
  };

  // Handle play/pause
  const handlePlayTrack = (track: any) => {
    if (!track || !track.audioUrl) {
      toast.error("Track audio is not available");
      return;
    }

    // Transform track to match the expected Track interface
    // Similar to dashboard transformation logic
    const transformedTrack = {
      id: track.id,
      title: track.title,
      artist:
        track.artist?.displayName || track.artist?.name || "Unknown Artist",
      album: "Unknown Album",
      createdAt: track.createdAt || new Date().toISOString(),
      duration: track.duration || 0,
      imageUrl: track.coverArt || "/images/artist.svg",
      audioUrl: track.audioUrl,
      artistId: track.artistId,
      artistDetails: track.artist || null,
      // Include additional track properties for consistency
      lyrics: track.lyrics,
      isrcCode: track.isrcCode,
      genreId: track.genreId,
      isPublished: track.isPublished,
      albumId: track.albumId,
      trackNumber: track.trackNumber,
      playLists: track.playLists,
      updatedAt: track.updatedAt,
    };

    if (currentTrack?.id === transformedTrack.id) {
      togglePlay();
    } else {
      playTrack(transformedTrack);
    }
  };

  // isLoading is already defined from useMarketplace hook

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#950944]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-[#3D2250] to-[#1E1632] text-white">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">NFT Marketplace</h1>
            <p className="text-gray-400 mt-2">
              Discover and purchase exclusive artist tokens (ERC-1155)
            </p>
          </div>
          <Badge variant="outline" className="text-[#950944] border-[#950944]">
            {filteredTokens.length} Tokens Available
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by track title or artist name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Artist Filter */}
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md text-white"
          >
            <option value="">All Artists</option>
            {uniqueArtists.map((artist) => (
              <option key={artist.walletAddress} value={artist.walletAddress}>
                {artist.displayName || artist.username}
              </option>
            ))}
          </select>

          {/* Price Range */}
          <div className="flex gap-2">
            <Input
              placeholder="Min Price"
              type="number"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-24 bg-zinc-900/50 border-zinc-700 text-white placeholder-gray-400"
            />
            <Input
              placeholder="Max Price"
              type="number"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-24 bg-zinc-900/50 border-zinc-700 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Tokens Grid */}
      {filteredTokens.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No tokens found
          </h3>
          <p className="text-gray-400">
            Try adjusting your search criteria or check back later for new
            tokens.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTokens.map((token) => {
            const purchaseAmountStr = purchaseAmounts[token.id] || "";
            const purchaseAmount = parseInt(purchaseAmountStr) || 1;
            const totalPrice = token.pricePerToken * purchaseAmount;
            const isCurrentTrack =
              Number(currentTrack?.id) === Number(token.track?.id);
            const isPurchasing = purchasingTokens.has(token.id);

            return (
              <div
                key={token.id}
                className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700 hover:border-[#950944] transition-colors"
              >
                {/* Track Info */}
                <div className="relative mb-4">
                  {token.track?.coverArt ? (
                    <Image
                      src={token.track.coverArt}
                      alt={token.track.title || "Track"}
                      width={200}
                      height={200}
                      className="w-full aspect-square object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-zinc-800 rounded-md flex items-center justify-center">
                      <Music className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  {token.track && (
                    <Button
                      onClick={() => handlePlayTrack(token.track)}
                      size="sm"
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#950944] hover:bg-[#7a0735] p-0"
                    >
                      {isCurrentTrack && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Track Details */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-white truncate">
                    {token.track?.title || "Unknown Track"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="truncate">
                      {token.artist?.displayName ||
                        token.artist?.username ||
                        "Unknown Artist"}
                    </span>
                  </div>
                </div>

                {/* Token Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Available:</span>
                    <Badge
                      variant="outline"
                      className="text-[#950944] border-[#950944]"
                    >
                      {token.amount} tokens
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Price per token:
                    </span>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-white">
                        {token.pricePerToken.toFixed(4)} CTSI
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purchase Controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Amount:</label>
                    <Input
                      type="number"
                      min="1"
                      max={token.amount}
                      value={purchaseAmountStr}
                      onChange={(e) =>
                        handleAmountChange(token.id, e.target.value)
                      }
                      placeholder="1"
                      className="flex-1 bg-zinc-800 border-zinc-600 text-white"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Total:</span>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-white">
                        {totalPrice.toFixed(4)} CTSI
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(token)}
                    disabled={
                      isPurchasing ||
                      !walletAddress ||
                      purchaseAmount > token.amount ||
                      purchaseAmount < 1 ||
                      !purchaseAmountStr
                    }
                    className="w-full bg-[#950944] hover:bg-[#7a0735] text-white"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Purchasing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Purchase Tokens
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NFTMarketplace;
