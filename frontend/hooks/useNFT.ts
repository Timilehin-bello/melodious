import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useActiveAccount } from "thirdweb/react";
import { useRepositoryData, noticesKeys } from "./useNoticesQuery";
import { useRollups } from "../cartesi/hooks/useRollups";
import {
  mintTrackNFTPortal,
  mintArtistTokens,
  purchaseArtistTokens,
} from "../cartesi/Portals";
import { Track } from "@/types";
import { User } from "./useUserByWallet";

// NFT types
export interface TrackNFT {
  id: number;
  owner: string;
  trackId: string;
  ipfsHash: string;
  royaltyPercentage: number;
  mintedAt: number;
  isActive: boolean;
  tokenId?: number;
}

export interface IPurchaseArtistTokens {
  id: number;
  buyer: string;
  trackId: string;
  amount: number;
  totalPrice: number;
  purchasedAt: number;
}

export interface ArtistToken {
  id: number;
  owner: string;
  trackId: string;
  amount: number; // This represents totalSupply for minted tokens
  totalSupply: number; // Total tokens minted
  availableSupply: number; // Tokens available for purchase
  pricePerToken: number;
  mintedAt: number;
  isActive: boolean;
  tokenId?: number;
}

export interface ArtistTokenPurchase {
  id: number;
  buyer: string;
  trackId: string;
  amount: number;
  totalPrice: number;
  purchasedAt: number;
  transactionHash?: string;
}

export interface NFTStats {
  totalTrackNFTs: number;
  totalArtistTokens: number;
  totalTokensSold: number;
  totalRevenue: number;
  averageTokenPrice: number;
}

export interface MintTrackNFTRequest {
  trackId: string;
  ipfsHash: string;
  royaltyPercentage: number;
}

export interface MintArtistTokensRequest {
  trackId: string;
  amount: number;
  pricePerToken: number;
}

export interface PurchaseArtistTokensRequest {
  trackId: number;
  amount: number;
  totalPrice: number;
}

// Query Keys
export const nftKeys = {
  all: ["nfts"] as const,
  trackNFTs: (walletAddress?: string) =>
    [...nftKeys.all, "trackNFTs", walletAddress] as const,
  artistTokens: (walletAddress?: string) =>
    [...nftKeys.all, "artistTokens", walletAddress] as const,
  artistTokenPurchases: (walletAddress?: string) =>
    [...nftKeys.all, "artistTokenPurchases", walletAddress] as const,
  nftStats: (walletAddress?: string) =>
    [...nftKeys.all, "nftStats", walletAddress] as const,
  userNFTs: (walletAddress?: string) =>
    [...nftKeys.all, "userNFTs", walletAddress] as const,
  allTrackNFTs: () => [...nftKeys.all, "allTrackNFTs"] as const,
  allArtistTokens: () => [...nftKeys.all, "allArtistTokens"] as const,
  marketplace: () => [...nftKeys.all, "marketplace"] as const,
};

// Hook to get Track NFTs (ERC-721)
export const useTrackNFTs = (walletAddress?: string) => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: nftKeys.trackNFTs(walletAddress),
    queryFn: async (): Promise<TrackNFT[]> => {
      if (!repositoryData) {
        throw new Error("Repository data not available");
      }

      const { trackNFTs } = repositoryData;

      console.log("trackNFTs", trackNFTs);

      if (!trackNFTs) {
        return [];
      }

      console.log("useTrackNFTs", trackNFTs, walletAddress);

      // Filter by wallet address if provided
      let filteredNFTs = trackNFTs;
      if (walletAddress) {
        filteredNFTs = trackNFTs.filter(
          (nft: any) => nft.owner?.toLowerCase() === walletAddress.toLowerCase()
        );
      }

      return filteredNFTs.map((nft: any) => ({
        id: nft.id,
        trackId: nft.trackId,
        ownerAddress: nft.ownerAddress,
        ipfsHash: nft.ipfsHash,
        royaltyPercentage: nft.royaltyPercentage,
        mintedAt: nft.mintedAt,
        contractAddress: nft.contractAddress,
      }));
    },
    enabled: !!repositoryData && !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get Artist Tokens (ERC-1155)
export const useArtistTokens = (walletAddress?: string) => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: nftKeys.artistTokens(walletAddress),
    queryFn: async (): Promise<ArtistToken[]> => {
      if (!repositoryData) {
        throw new Error("Repository data not available");
      }

      const { artistTokens } = repositoryData;

      if (!artistTokens) {
        return [];
      }

      // Filter by creator wallet address if provided
      let filteredTokens = artistTokens;
      if (walletAddress) {
        filteredTokens = artistTokens.filter(
          (token: ArtistToken) =>
            token.owner?.toLowerCase() === walletAddress.toLowerCase()
        );
      }

      console.log("filtered token", filteredTokens);

      return filteredTokens.map((token: ArtistToken) => ({
        id: token.id,
        trackId: token.trackId,
        tokenId: token.tokenId,
        amount: token.amount,
        pricePerToken: token.pricePerToken,
        mintedAt: token.mintedAt,
        isActive: token.isActive,
        owner: token.owner,
      }));
    },
    enabled: !!repositoryData && !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get Artist Token Purchases
export const useArtistTokenPurchases = (walletAddress?: string) => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: nftKeys.artistTokenPurchases(walletAddress),
    queryFn: async (): Promise<ArtistTokenPurchase[]> => {
      if (!repositoryData) {
        throw new Error("Repository data not available");
      }

      const { artistTokenPurchases } = repositoryData;

      if (!artistTokenPurchases) {
        return [];
      }

      // Filter by buyer wallet address if provided
      let filteredPurchases: IPurchaseArtistTokens[] = artistTokenPurchases;
      if (walletAddress) {
        filteredPurchases = artistTokenPurchases.filter(
          (purchase: IPurchaseArtistTokens) =>
            purchase.buyer?.toLowerCase() === walletAddress.toLowerCase()
        );
      }

      return filteredPurchases.map((purchase: IPurchaseArtistTokens) => ({
        id: purchase.id,
        trackId: purchase.trackId,
        buyer: purchase.buyer,
        amount: purchase.amount,
        totalPrice: purchase.totalPrice,
        purchasedAt: purchase.purchasedAt,
      }));
    },
    enabled: !!repositoryData && !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get all Track NFTs (unfiltered)
export const useAllTrackNFTs = () => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: nftKeys.allTrackNFTs(),
    queryFn: async (): Promise<TrackNFT[]> => {
      if (!repositoryData) {
        throw new Error("Repository data not available");
      }

      const { trackNFTs } = repositoryData;

      if (!trackNFTs) {
        return [];
      }

      return trackNFTs.map((nft: any) => ({
        id: nft.id,
        trackId: nft.trackId,
        owner: nft.owner,
        ipfsHash: nft.ipfsHash,
        royaltyPercentage: nft.royaltyPercentage,
        mintedAt: nft.mintedAt,
        isActive: nft.isActive,
        tokenId: nft.tokenId,
      }));
    },
    enabled: !!repositoryData && !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get all Artist Tokens (unfiltered)
export const useAllArtistTokens = () => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: nftKeys.allArtistTokens(),
    queryFn: async (): Promise<ArtistToken[]> => {
      if (!repositoryData) {
        throw new Error("Repository data not available");
      }

      const { artistTokens } = repositoryData;

      if (!artistTokens) {
        return [];
      }

      return artistTokens.map((token: ArtistToken) => ({
        id: token.id,
        trackId: token.trackId,
        tokenId: token.tokenId,
        amount: token.amount,
        pricePerToken: token.pricePerToken,
        mintedAt: token.mintedAt,
        isActive: token.isActive,
        owner: token.owner,
      }));
    },
    enabled: !!repositoryData && !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Marketplace hook that combines all necessary data for the marketplace page
export const useMarketplace = () => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();
  const purchaseTokensMutation = usePurchaseArtistTokens();

  return useQuery({
    queryKey: nftKeys.marketplace(),
    queryFn: async () => {
      if (!repositoryData) {
        throw new Error("Repository data not available");
      }

      const { artistTokens, tracks, users } = repositoryData;

      if (!artistTokens || !tracks || !users) {
        return {
          artistTokens: [],
          tracks: [],
          users: [],
          enrichedTokens: [],
        };
      }

      // Filter only active tokens with available amount
      const activeTokens = artistTokens.filter(
        (token: ArtistToken) => token.isActive && token.availableSupply > 0
      );

      // Enrich tokens with track and artist details
      const enrichedTokens = activeTokens.map((token: ArtistToken) => {
        const track: Track | undefined = tracks.find(
          (t: Track) => t.id === Number(token.trackId)
        );
        const artist: User | undefined = users.find(
          (u: User) =>
            u.walletAddress?.toLowerCase() === token.owner?.toLowerCase()
        );

        console.log("usermarketplace", track);

        return {
          ...token,
          track: track
            ? {
                id: track.id,
                title: track.title,
                artist: users.find((u: User) => u.id === track.artistId),
                artistId: track.artistId,
                coverArt: track.imageUrl,
                duration: track.duration,
                audioUrl: track.audioUrl,
                lyrics: track.lyrics,
                isrcCode: track.isrcCode,
                genreId: track.genreId,
                isPublished: track.isPublished,
                albumId: track.albumId,
                trackNumber: track.trackNumber,
                playLists: track.playLists,
                createdAt: track.createdAt,
                updatedAt: track.updatedAt,
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
      });

      return {
        artistTokens: activeTokens,
        tracks,
        users,
        enrichedTokens,
      };
    },
    enabled: !!repositoryData && !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook to get NFT Statistics
export const useNFTStats = (walletAddress?: string) => {
  const { repositoryData } = useRepositoryData();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: nftKeys.nftStats(walletAddress),
    queryFn: async (): Promise<NFTStats> => {
      if (!repositoryData) {
        throw new Error("Repository data not available");
      }

      const { trackNFTs, artistTokens, artistTokenPurchases } = repositoryData;

      // Filter data by wallet address if provided
      let filteredTrackNFTs = trackNFTs || [];
      let filteredArtistTokens = artistTokens || [];
      let filteredPurchases = artistTokenPurchases || [];

      if (walletAddress) {
        filteredTrackNFTs = (trackNFTs || []).filter(
          (nft: TrackNFT) =>
            nft.owner?.toLowerCase() === walletAddress.toLowerCase()
        );
        filteredArtistTokens = (artistTokens || []).filter(
          (token: ArtistToken) =>
            token.owner?.toLowerCase() === walletAddress.toLowerCase()
        );

        // Filter purchases by trackId that belongs to the artist's tokens
        // Get trackIds from the artist's tokens
        const artistTrackIds = filteredArtistTokens.map(
          (token: ArtistToken) => token.trackId
        );

        filteredPurchases = (artistTokenPurchases || []).filter(
          (purchase: ArtistTokenPurchase) =>
            artistTrackIds.includes(purchase.trackId)
        );
      }

      // Calculate statistics
      const totalTrackNFTs = filteredTrackNFTs.length;
      const totalArtistTokens = filteredArtistTokens.length;
      const totalTokensSold = filteredPurchases.reduce(
        (sum: number, purchase: ArtistTokenPurchase) =>
          sum + (purchase.amount || 0),
        0
      );
      const totalRevenue = filteredPurchases.reduce(
        (sum: number, purchase: ArtistTokenPurchase) =>
          sum + (purchase.totalPrice || 0),
        0
      );
      const averageTokenPrice =
        totalTokensSold > 0 ? totalRevenue / totalTokensSold : 0;

      return {
        totalTrackNFTs,
        totalArtistTokens,
        totalTokensSold,
        totalRevenue,
        averageTokenPrice,
      };
    },
    enabled: !!repositoryData && !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Mutation hook to mint Track NFT (ERC-721)
export const useMintTrackNFT = () => {
  const dappAddress = process.env.NEXT_PUBLIC_DAPP_ADDRESS || "";
  const rollups = useRollups(dappAddress);
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { repositoryData } = useRepositoryData();

  return useMutation({
    mutationFn: async (request: MintTrackNFTRequest) => {
      if (!rollups || !activeAccount || !repositoryData) {
        throw new Error("Rollups, wallet, or repository data not available");
      }

      // Get contract address from repository config
      const trackNftContractAddress =
        repositoryData.config?.trackNftContractAddress;
      if (!trackNftContractAddress) {
        throw new Error("Track NFT contract address not found in config");
      }

      // Get signer from rollups
      const signer = rollups.signer;
      if (!signer) {
        throw new Error("Signer not available");
      }

      try {
        const response = await mintTrackNFTPortal(
          rollups,
          signer,
          trackNftContractAddress,
          request.trackId,
          request.ipfsHash,
          request.royaltyPercentage,
          dappAddress
        );
        return response;
      } catch (error) {
        console.error("Error minting Track NFT:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Successfully minted Track NFT for track ${variables.trackId}!`
      );

      // Immediate invalidation
      queryClient.invalidateQueries({
        queryKey: noticesKeys.lists(),
      });

      // Add a small delay to allow backend processing, then force refetch
      setTimeout(() => {
        // Force refetch notices query to refresh repository data immediately
        queryClient.resetQueries({
          queryKey: noticesKeys.lists(),
        });
        queryClient.refetchQueries({
          queryKey: noticesKeys.lists(),
          type: "active",
        });

        // Invalidate and refetch related queries
        queryClient.invalidateQueries({
          queryKey: nftKeys.trackNFTs(activeAccount?.address),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.nftStats(activeAccount?.address),
        });
      }, 3000); // 3 second delay to allow backend processing
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to mint Track NFT";
      toast.error(errorMessage);
      console.error("Mint Track NFT error:", error);
    },
  });
};

// Mutation hook to mint Artist Tokens (ERC-1155)
export const useMintArtistTokens = () => {
  const dappAddress = process.env.NEXT_PUBLIC_DAPP_ADDRESS || "";
  const rollups = useRollups(dappAddress);
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();

  return useMutation({
    mutationFn: async (request: MintArtistTokensRequest) => {
      if (!rollups || !activeAccount) {
        throw new Error("Rollups not available or wallet not connected");
      }

      try {
        const response = await mintArtistTokens(
          rollups,
          dappAddress,
          request.trackId,
          request.amount,
          request.pricePerToken
        );
        return response;
      } catch (error) {
        console.error("Error minting Artist Tokens:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Successfully minted ${variables.amount} Artist Tokens for track ${variables.trackId}!`
      );

      // Immediate invalidation
      queryClient.invalidateQueries({
        queryKey: noticesKeys.lists(),
      });

      // Add a small delay to allow backend processing, then force refetch
      setTimeout(() => {
        // Force refetch notices query to refresh repository data immediately
        queryClient.resetQueries({
          queryKey: noticesKeys.lists(),
        });
        queryClient.refetchQueries({
          queryKey: noticesKeys.lists(),
          type: "active",
        });

        // Invalidate and refetch related queries
        queryClient.invalidateQueries({
          queryKey: nftKeys.artistTokens(activeAccount?.address),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.nftStats(activeAccount?.address),
        });
      }, 3000); // 3 second delay to allow backend processing
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to mint Artist Tokens";
      toast.error(errorMessage);
      console.error("Mint Artist Tokens error:", error);
    },
  });
};

// Mutation hook to purchase Artist Tokens
export const usePurchaseArtistTokens = () => {
  const dappAddress = process.env.NEXT_PUBLIC_DAPP_ADDRESS || "";
  const rollups = useRollups(dappAddress);
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();

  return useMutation({
    mutationFn: async (request: PurchaseArtistTokensRequest) => {
      if (!rollups || !activeAccount) {
        throw new Error("Rollups not available or wallet not connected");
      }

      console.log(
        "Purchase Artist Tokens request:",
        request.trackId,
        request.amount,
        request.totalPrice
      );

      try {
        const response = await purchaseArtistTokens(
          rollups,
          dappAddress,
          request.trackId,
          request.amount,
          request.totalPrice
        );
        return response;
      } catch (error) {
        console.error("Error purchasing Artist Tokens:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Successfully purchased ${variables.amount} Artist Tokens!`
      );

      // Immediate invalidation
      queryClient.invalidateQueries({
        queryKey: noticesKeys.lists(),
      });

      // Add a small delay to allow backend processing, then force refetch
      setTimeout(() => {
        // Force refetch notices query to refresh repository data immediately
        queryClient.resetQueries({
          queryKey: noticesKeys.lists(),
        });
        queryClient.refetchQueries({
          queryKey: noticesKeys.lists(),
          type: "active",
        });

        // Invalidate and refetch related queries
        queryClient.invalidateQueries({
          queryKey: nftKeys.artistTokenPurchases(activeAccount?.address),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.nftStats(activeAccount?.address),
        });
      }, 3000); // 3 second delay to allow backend processing
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to purchase Artist Tokens";
      toast.error(errorMessage);
      console.error("Purchase Artist Tokens error:", error);
    },
  });
};

// Hook to get current user's NFT data (convenience hook)
export const useMyNFTData = () => {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;

  const trackNFTsQuery = useTrackNFTs(walletAddress);
  const artistTokensQuery = useArtistTokens(walletAddress);
  const artistTokenPurchasesQuery = useArtistTokenPurchases(walletAddress);
  const nftStatsQuery = useNFTStats(walletAddress);

  return {
    trackNFTs: trackNFTsQuery.data,
    artistTokens: artistTokensQuery.data,
    artistTokenPurchases: artistTokenPurchasesQuery.data,
    nftStats: nftStatsQuery.data,
    isLoading:
      trackNFTsQuery.isLoading ||
      artistTokensQuery.isLoading ||
      artistTokenPurchasesQuery.isLoading ||
      nftStatsQuery.isLoading,
    isError:
      trackNFTsQuery.isError ||
      artistTokensQuery.isError ||
      artistTokenPurchasesQuery.isError ||
      nftStatsQuery.isError,
    error:
      trackNFTsQuery.error ||
      artistTokensQuery.error ||
      artistTokenPurchasesQuery.error ||
      nftStatsQuery.error,
    refetch: () => {
      trackNFTsQuery.refetch();
      artistTokensQuery.refetch();
      artistTokenPurchasesQuery.refetch();
      nftStatsQuery.refetch();
    },
  };
};
