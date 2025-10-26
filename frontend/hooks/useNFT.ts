import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useActiveAccount } from "thirdweb/react";
import { useRepositoryData, noticesKeys } from "./useNoticesQuery";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  readContract,
} from "thirdweb";
import { TrackNFTABI, ArtistTokenABI } from "@/configs";
import CTSITokenABI from "@/configs/CTSITokenABI.json";
import { Track } from "@/types";
import { User } from "./useUserByWallet";
import { ethers } from "ethers";
import { client } from "@/lib/client";
import { networkChain } from "@/components/ConnectWallet";

// Helper function to get contract addresses from repository data
const getContractAddresses = (repositoryData: any) => {
  return {
    trackNFT: repositoryData?.config?.trackNftContractAddress,
    artistToken: repositoryData?.config?.artistTokenContractAddress,
    ctsiToken: repositoryData?.config?.cartesiTokenContractAddress,
    inputBox:
      process.env.NEXT_PUBLIC_INPUTBOX_ADDRESS ||
      "0xc70074BDD26d8cF983Ca6A5b89b8db52D5850051",
    dappAddress:
      process.env.NEXT_PUBLIC_DAPP_ADDRESS ||
      "0x42a9deb3d560884b3dfd4ae83908d80f9c1bc5db",
  };
};

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
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { repositoryData } = useRepositoryData();

  return useMutation({
    mutationFn: async (request: MintTrackNFTRequest) => {
      if (!activeAccount || !repositoryData) {
        throw new Error("Wallet or repository data not available");
      }

      // Get contract addresses from repository config
      const addresses = getContractAddresses(repositoryData);
      if (!addresses.trackNFT) {
        throw new Error("Track NFT contract address not found in config");
      }

      try {
        // Create contract instance
        const contract = getContract({
          client,
          chain: networkChain,
          address: addresses.trackNFT,
          abi: TrackNFTABI as any,
        });

        console.log("Minting Track NFT for trackId:", contract);

        // Construct JSON payload for Cartesi backend
        const payload = JSON.stringify({
          method: "mint_track_nft",
          args: {
            walletAddress: activeAccount.address,
            trackId: request.trackId,
            ipfsHash: request.ipfsHash,
            royaltyPercentage: request.royaltyPercentage,
            timestamp: Math.floor(Date.now() / 1000),
            signer: activeAccount.address,
            createdAt: Math.floor(Date.now() / 1000),
          },
        });

        // Convert payload to bytes (hex format)
        const payloadBytes = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(payload)
        );

        // Prepare the contract call
        const transaction = prepareContractCall({
          contract,
          method: "mintTrackNFT",
          params: [
            activeAccount.address, // to
            request.trackId, // trackId
            activeAccount.address, // artistWallet
            request.ipfsHash, // ipfsHash
            request.royaltyPercentage, // royaltyPercentage
            payloadBytes, // payload
          ],
        });

        // Send the transaction
        const result = await sendTransaction({
          transaction,
          account: activeAccount,
        });

        return result;
      } catch (error) {
        console.error("Error minting Track NFT:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // toast.success(
      //   `Successfully minted Track NFT for track ${variables.trackId}!`
      // );

      // Add a delay for backend processing, then force refetch
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: noticesKeys.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.trackNFTs(activeAccount?.address),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.nftStats(activeAccount?.address),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.allTrackNFTs(),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.marketplace(),
        });
        queryClient.refetchQueries({
          queryKey: noticesKeys.lists(),
          type: "active",
        });
        queryClient.refetchQueries({
          queryKey: nftKeys.trackNFTs(activeAccount?.address),
          type: "active",
        });
      }, 3000); // 2 second delay
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
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { repositoryData } = useRepositoryData();

  return useMutation({
    mutationFn: async (request: MintArtistTokensRequest) => {
      if (!activeAccount || !repositoryData) {
        throw new Error("Wallet or repository data not available");
      }

      // Get contract addresses from repository config
      const addresses = getContractAddresses(repositoryData);
      if (!addresses.artistToken) {
        throw new Error("Artist Token contract address not found in config");
      }

      try {
        // Create contract instance
        const contract = getContract({
          client,
          chain: networkChain,
          address: addresses.artistToken,
          abi: ArtistTokenABI as any,
        });

        // Construct JSON payload for Cartesi backend
        const payload = JSON.stringify({
          method: "mint_artist_tokens",
          args: {
            artistWallet: activeAccount.address,
            trackId: request.trackId,
            amount: request.amount,
            pricePerToken: request.pricePerToken,
            timestamp: Math.floor(Date.now() / 1000),
            signer: activeAccount.address,
          },
        });

        // Convert payload to bytes (hex format)
        const payloadBytes = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(payload)
        );

        // Prepare the contract call
        const transaction = prepareContractCall({
          contract,
          method: "mintArtistTokens",
          params: [
            request.trackId, // trackId
            activeAccount.address, // artistWallet
            BigInt(request.amount), // supply
            ethers.utils.parseEther(request.pricePerToken.toString()), // pricePerToken in wei
            payloadBytes, // payload
          ],
        } as any);

        // Send the transaction
        const result = await sendTransaction({
          transaction,
          account: activeAccount,
        });

        return result;
      } catch (error) {
        console.error("Error minting Artist Tokens:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // toast.success(
      //   `Successfully minted ${variables.amount} Artist Tokens for track ${variables.trackId}!`
      // );

      // Add a delay for backend processing, then force refetch
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: noticesKeys.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.artistTokens(activeAccount?.address),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.nftStats(activeAccount?.address),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.allArtistTokens(),
        });
        queryClient.invalidateQueries({
          queryKey: nftKeys.marketplace(),
        });

        queryClient.refetchQueries({
          queryKey: noticesKeys.lists(),
          type: "active",
        });
        queryClient.refetchQueries({
          queryKey: nftKeys.artistTokens(activeAccount?.address),
          type: "active",
        });
      }, 3000); // 2 second delay
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
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { repositoryData } = useRepositoryData();

  const mutation = useMutation({
    mutationFn: async (request: PurchaseArtistTokensRequest) => {
      if (!activeAccount || !repositoryData) {
        throw new Error("Wallet or repository data not available");
      }

      // Get contract addresses from repository config
      const addresses = getContractAddresses(repositoryData);
      if (!addresses.artistToken) {
        throw new Error("Artist Token contract address not found in config");
      }

      console.log(
        "Purchase Artist Tokens request:",
        request.trackId,
        request.amount,
        request.totalPrice
      );

      try {
        // Get CTSI token contract address from repository config
        if (!addresses.ctsiToken) {
          throw new Error("CTSI Token contract address not found in config");
        }

        // Get CTSI token contract instance
        const ctsiContract = getContract({
          client,
          chain: networkChain,
          address: addresses.ctsiToken,
          abi: CTSITokenABI as any,
        });

        // First, we need to get the tokenId and check the contract's pricePerToken
        // to calculate the exact totalCost that the contract will use

        // Get Artist Token contract instance
        const artistTokenContract = getContract({
          client,
          chain: networkChain,
          address: addresses.artistToken,
          abi: ArtistTokenABI as any,
        });

        // Check if tokens exist for this trackId
        console.log(`Checking if tokens exist for trackId: ${request.trackId}`);
        const tokensExist = await readContract({
          contract: artistTokenContract,
          method: "areTokensCreated",
          params: [request.trackId.toString()],
        });

        if (!tokensExist) {
          throw new Error(
            `Artist Tokens have not been minted for track ${request.trackId} yet. Please mint them first.`
          );
        }

        // Get tokenId for this trackId
        console.log(`Getting tokenId for trackId: ${request.trackId}`);
        const tokenId = await readContract({
          contract: artistTokenContract,
          method: "getTokenIdByTrackId",
          params: [request.trackId.toString()],
        });
        console.log(`Retrieved tokenId: ${tokenId}`);

        // Get token info to get the exact pricePerToken stored in the contract
        const tokenInfo = await readContract({
          contract: artistTokenContract,
          method: "getTokenInfo",
          params: [tokenId],
        });

        // Calculate the exact totalCost that the contract will calculate
        const contractPricePerToken = tokenInfo.pricePerToken;
        const totalCostWei = contractPricePerToken * BigInt(request.amount);

        console.log(`Contract pricePerToken (wei): ${contractPricePerToken}`);
        console.log(`Amount: ${request.amount}`);
        console.log(`Total cost (wei): ${totalCostWei}`);
        console.log(
          `Total cost (ether): ${ethers.utils.formatEther(
            totalCostWei.toString()
          )}`
        );

        // Step 1: Check user's CTSI balance
        console.log("Checking CTSI balance...");
        const userBalance = await readContract({
          contract: ctsiContract,
          method: "balanceOf",
          params: [activeAccount.address],
        });

        // Convert balance from wei to ether for display
        const balanceInEther = ethers.utils.formatEther(userBalance.toString());
        console.log(`User CTSI balance: ${balanceInEther} CTSI`);
        console.log(
          `Required amount: ${ethers.utils.formatEther(
            totalCostWei.toString()
          )} CTSI`
        );

        // Debug: Log actual values for comparison
        console.log(`User balance (wei): ${userBalance.toString()}`);
        console.log(`Required cost (wei): ${totalCostWei.toString()}`);
        console.log(`Balance >= Cost: ${userBalance >= totalCostWei}`);

        // Check if user has enough balance
        if (userBalance < totalCostWei) {
          throw new Error(
            `Insufficient CTSI balance. Required: ${ethers.utils.formatEther(
              totalCostWei.toString()
            )} CTSI, Available: ${balanceInEther} CTSI`
          );
        }

        // Step 2: Approve CTSI token spending
        console.log("Approving CTSI token spending...");
        const approveTransaction = prepareContractCall({
          contract: ctsiContract,
          method: "approve",
          params: [addresses.artistToken, totalCostWei],
        } as any);

        await sendTransaction({
          transaction: approveTransaction,
          account: activeAccount,
        });

        // Step 3: Purchase artist tokens
        // Construct JSON payload for Cartesi backend
        const payload = JSON.stringify({
          method: "purchase_artist_tokens",
          args: {
            buyerAddress: activeAccount.address,
            trackId: request.trackId.toString(),
            amount: request.amount,
            totalPrice: request.totalPrice,
            timestamp: Math.floor(Date.now() / 1000),
            signer: activeAccount.address,
            createdAt: Math.floor(Date.now() / 1000),
          },
        });

        // Convert payload to bytes (hex format)
        const payloadBytes = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(payload)
        );

        // Log all parameters being sent to the contract
        console.log("Contract call parameters:");
        console.log("- tokenId:", tokenId.toString());
        console.log("- amount:", request.amount);
        console.log("- amount (BigInt):", BigInt(request.amount).toString());
        console.log("- buyerAddress:", activeAccount.address);
        console.log("- payloadBytes length:", payloadBytes.length);
        console.log("- payloadBytes:", payloadBytes);

        // Debug: Check if tokenId is valid
        console.log("- tokenId type:", typeof tokenId);
        console.log("- tokenId value check:", tokenId > BigInt(0));

        // Prepare the purchase contract call
        const purchaseTransaction = prepareContractCall({
          contract: artistTokenContract,
          method: "purchaseTokens",
          params: [
            tokenId, // tokenId (obtained from trackId) - keep as BigInt
            BigInt(request.amount), // amount
            activeAccount.address, // buyerAddress
            payloadBytes, // payload
          ],
        } as any);

        // Send the purchase transaction
        console.log("Purchasing artist tokens...");
        const result = await sendTransaction({
          transaction: purchaseTransaction,
          account: activeAccount,
        });

        return result;
      } catch (error) {
        console.error("Error purchasing Artist Tokens:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // toast.success(
      //   `Successfully purchased ${variables.amount} Artist Tokens!`
      // );

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
        queryClient.invalidateQueries({
          queryKey: nftKeys.marketplace(),
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

  return {
    ...mutation,
    refetch: () => {
      // Invalidate all relevant queries
      // queryClient.invalidateQueries({
      //   queryKey: nftKeys.artistTokenPurchases(activeAccount?.address),
      // });
      // queryClient.invalidateQueries({
      //   queryKey: nftKeys.nftStats(activeAccount?.address),
      // });
      // queryClient.invalidateQueries({
      //   queryKey: noticesKeys.lists(),
      // });
      queryClient.invalidateQueries({
        queryKey: nftKeys.marketplace(),
      });
    },
  };
};

// Hook to get current user's NFT data (convenience hook)
export const useMyNFTData = () => {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const queryClient = useQueryClient();

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
      // Invalidate all NFT-related queries for this wallet
      queryClient.invalidateQueries({
        queryKey: nftKeys.trackNFTs(walletAddress),
      });
      queryClient.invalidateQueries({
        queryKey: nftKeys.artistTokens(walletAddress),
      });
      queryClient.invalidateQueries({
        queryKey: nftKeys.artistTokenPurchases(walletAddress),
      });
      queryClient.invalidateQueries({
        queryKey: nftKeys.nftStats(walletAddress),
      });

      // Also invalidate notices to refresh repository data
      queryClient.invalidateQueries({
        queryKey: noticesKeys.lists(),
      });
    },
  };
};
