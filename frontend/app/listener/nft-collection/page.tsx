"use client";

import React, { useState, useMemo } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Music,
  Search,
  Coins,
  Play,
  Pause,
  User,
  Calendar,
  TrendingUp,
  Wallet,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useArtistTokenPurchases, useMyNFTData } from "@/hooks/useNFT";
import { useRepositoryDataJsonRpc } from "@/hooks/useNoticesJsonRpcQuery";
import { useMusicPlayer } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { format } from "date-fns";
import { Track } from "@/types";
import toast from "react-hot-toast";
import { User as IUser } from "@/hooks/useUserByWallet";

interface TokenHolding {
  id: number;
  tokenId?: number;
  buyer: string;
  trackId: string;
  amount: number;
  totalPrice: number;
  purchasedAt: number;
  transactionHash?: string;
  track?: {
    id: string;
    title: string;
    artist: string;
    coverArt: string;
    duration: number;
    audioUrl: string;
  };
  artist?: {
    displayName: string;
    username: string;
    walletAddress: string;
  };
}

const NFTCollection = () => {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "value">("recent");

  // Fetch user's NFT data
  const {
    artistTokenPurchases,
    isLoading: nftLoading,
    refetch,
  } = useMyNFTData();
  const { repositoryData, isLoading: repoLoading } = useRepositoryDataJsonRpc();

  // Music player
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();

  // Get tracks and users data for enriching token information
  const tracks = useMemo(
    () => repositoryData?.tracks || [],
    [repositoryData?.tracks]
  );
  const users = useMemo(
    () => repositoryData?.users || [],
    [repositoryData?.users]
  );

  // Enrich token purchases with track and artist details and consolidate by trackId
  const enrichedHoldings: TokenHolding[] = useMemo(() => {
    if (!artistTokenPurchases || !tracks || !users) return [];
    console.log("artistTokenPurchases:", artistTokenPurchases);

    // Group purchases by trackId
    const groupedPurchases = artistTokenPurchases.reduce((acc, purchase) => {
      const key = purchase.trackId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(purchase);
      return acc;
    }, {} as Record<string, typeof artistTokenPurchases>);

    // Create consolidated holdings
    const collection = Object.entries(groupedPurchases).map(
      ([trackId, purchases]): TokenHolding => {
        const track = tracks.find((t: Track) => t.id.toString() === trackId);
        console.log("artistTokenPurchases Track:", track);

        // Use the first purchase for basic info, but consolidate amounts and prices
        const firstPurchase = purchases[0];
        const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
        const totalPrice = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
        const earliestPurchase = purchases.reduce((earliest, p) =>
          p.purchasedAt < earliest.purchasedAt ? p : earliest
        );

        // Find the artist user by matching user.artist.id with track.artistId
        const artist: IUser | undefined = users.find(
          (u: IUser) =>
            u.artist &&
            track?.artistId &&
            u.artist.id === parseInt(track.artistId.toString())
        );

        const tokenHoldings = {
          id: firstPurchase.id,
          tokenId: firstPurchase.id,
          buyer: firstPurchase.buyer,
          trackId: trackId,
          amount: totalAmount, // Consolidated total amount
          totalPrice: totalPrice, // Consolidated total price
          purchasedAt: earliestPurchase.purchasedAt, // Use earliest purchase date
          transactionHash: firstPurchase.transactionHash,
          track: track
            ? {
                id: track.id,
                title: track.title,
                artist:
                  artist?.displayName || artist?.username || "Unknown Artist",
                coverArt: track.imageUrl, // Use imageUrl from backend as coverArt
                duration: track.duration,
                audioUrl: track.audioUrl, // Add missing audioUrl field
              }
            : undefined,
          artist: artist
            ? {
                displayName: artist.displayName,
                username: artist.username,
                walletAddress: artist.walletAddress,
              }
            : undefined,
        };
        return tokenHoldings;
      }
    );

    console.log("consolidated collection", collection);
    return collection;
  }, [artistTokenPurchases, tracks, users]);

  // Filter and sort holdings
  const filteredAndSortedHoldings = useMemo(() => {
    let filtered = enrichedHoldings;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (holding) =>
          holding.track?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          holding.artist?.displayName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          holding.artist?.username
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.purchasedAt - a.purchasedAt;
        case "oldest":
          return a.purchasedAt - b.purchasedAt;
        case "value":
          return b.totalPrice - a.totalPrice;
        default:
          return b.purchasedAt - a.purchasedAt;
      }
    });

    return filtered;
  }, [enrichedHoldings, searchQuery, sortBy]);

  // Calculate collection stats
  const collectionStats = useMemo(() => {
    const totalTokens = enrichedHoldings.reduce(
      (sum, holding) => sum + holding.amount,
      0
    );
    const totalValue = enrichedHoldings.reduce(
      (sum, holding) => sum + holding.totalPrice,
      0
    );
    const uniqueTracks = new Set(enrichedHoldings.map((h) => h.track?.id)).size;
    const uniqueArtists = new Set(
      enrichedHoldings.map((h) => h.artist?.walletAddress)
    ).size;

    return {
      totalTokens,
      totalValue,
      uniqueTracks,
      uniqueArtists,
    };
  }, [enrichedHoldings]);

  // Handle play/pause
  const handlePlayTrack = (track: any) => {
    if (!track || !track.audioUrl) {
      toast.error("Track audio is not available");
      return;
    }

    // Transform track to match the expected Track interface
    const transformedTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist || "Unknown Artist",
      album: "Unknown Album",
      createdAt: new Date().toISOString(),
      duration: track.duration || 0,
      imageUrl: track.coverArt || "/images/artist.svg",
      audioUrl: track.audioUrl,
      artistId: track.artistId || 0,
      artistDetails: null,
    };

    if (currentTrack?.id === transformedTrack.id) {
      togglePlay();
    } else {
      playTrack(transformedTrack);
    }
  };

  const isLoading = nftLoading || repoLoading;

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Wallet className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-semibold text-white">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400 text-center max-w-md">
          Please connect your wallet to view your NFT collection.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#950944]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My NFT Collection</h1>
            <p className="text-gray-400 mt-2">
              Your collection of artist tokens and music NFTs
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-[#950944] text-[#950944] hover:bg-[#950944] hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Collection Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-400">Total Tokens</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {collectionStats.totalTokens}
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {collectionStats.totalValue} CTSI
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">Unique Tracks</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {collectionStats.uniqueTracks}
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-400">Artists</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {collectionStats.uniqueArtists}
            </p>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search your collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "recent" | "oldest" | "value")
            }
            className="px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md text-white"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="value">Highest Value</option>
          </select>
        </div>
      </div>

      {/* Collection Grid */}
      {filteredAndSortedHoldings.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {enrichedHoldings.length === 0
              ? "No NFTs in your collection"
              : "No matching NFTs found"}
          </h3>
          <p className="text-gray-400 mb-4">
            {enrichedHoldings.length === 0
              ? "Start building your collection by purchasing artist tokens from the marketplace."
              : "Try adjusting your search criteria."}
          </p>
          {enrichedHoldings.length === 0 && (
            <Button
              onClick={() => (window.location.href = "/listener/marketplace")}
              className="bg-[#950944] hover:bg-[#7a0735] text-white"
            >
              Visit Marketplace
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedHoldings.map((holding) => {
            const isCurrentTrack = currentTrack?.id === holding.track?.id;

            return (
              <div
                key={`${holding.tokenId}-${holding.purchasedAt}`}
                className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700 hover:border-[#950944] transition-colors"
              >
                {/* Track Info */}
                <div className="relative mb-4">
                  {holding.track?.coverArt ? (
                    <Image
                      src={holding.track.coverArt}
                      alt={holding.track.title || "Track"}
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
                  {holding.track && (
                    <Button
                      onClick={() => handlePlayTrack(holding.track)}
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

                  {/* Owned Badge */}
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                    Owned
                  </Badge>
                </div>

                {/* Track Details */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-white truncate">
                    {holding.track?.title || "Unknown Track"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="truncate">
                      {holding.artist?.displayName ||
                        holding.artist?.username ||
                        "Unknown Artist"}
                    </span>
                  </div>
                </div>

                {/* Holding Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Tokens Owned:</span>
                    <Badge
                      variant="outline"
                      className="text-[#950944] border-[#950944]"
                    >
                      {holding.amount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Purchase Price:
                    </span>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-white">
                        {holding.totalPrice} CTSI
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Purchased:</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {format(new Date(holding.purchasedAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Average Price */}
                <div className="pt-2 border-t border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Avg. Price per Token:
                    </span>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-white">
                        {(holding.totalPrice / holding.amount).toFixed(2)} CTSI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NFTCollection;
