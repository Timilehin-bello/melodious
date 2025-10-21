import { Error_out, Voucher } from "cartesi-wallet";
import { encodeFunctionData, hexToBytes, parseEther } from "viem";
import { ConfigService } from "./config.service";
import { RepositoryService } from "./repository.service";
import { TrackNFTABI, ArtistTokenABI } from "../configs";
import { TrackNFT, ArtistToken, ArtistTokenPurchase } from "../models";

interface IMintTrackNFT {
  walletAddress: string;
  trackId: string;
  ipfsHash: string;
  royaltyPercentage: number;
  timestamp?: number;
  signer?: string;
  createdAt?: number;
}

interface IMintArtistTokens {
  walletAddress: string;
  trackId: string;
  amount: number;
  pricePerToken: number;
  timestamp?: number;
  signer?: string;
  createdAt?: number;
}

interface IPurchaseArtistTokens {
  buyerAddress: string;
  trackId: string;
  amount: number;
  totalPrice: number;
  timestamp?: number;
  signer?: string;
  createdAt?: number;
}

class NFTService {
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }

  /**
   * Mint a TrackNFT (ERC721) for a specific track
   */
  mintTrackNFT(mintData: IMintTrackNFT) {
    if (!mintData.walletAddress || !mintData.trackId || !mintData.ipfsHash) {
      return new Error_out("Missing required fields for TrackNFT minting");
    }

    const config = this.configService.getConfig();
    if (!config) {
      return new Error_out("Failed to get configuration");
    }

    if (!config.trackNftContractAddress) {
      return new Error_out("TrackNFT contract address not configured");
    }

    try {
      // Comment out voucher creation since we're interacting with contracts directly
      // const callData = encodeFunctionData({
      //   abi: TrackNFTABI,
      //   functionName: "mintTrackNFT",
      //   args: [
      //     mintData.walletAddress,
      //     mintData.trackId,
      //     mintData.walletAddress, // artistWallet
      //     mintData.ipfsHash,
      //     mintData.royaltyPercentage,
      //   ],
      // });

      // const voucher = new Voucher(
      //   config.trackNftContractAddress,
      //   hexToBytes(callData)
      // );

      // Store NFT data in repository using the model
      const trackNFT = new TrackNFT(
        mintData.walletAddress,
        mintData.trackId,
        mintData.ipfsHash,
        mintData.royaltyPercentage,
        mintData.createdAt || Date.now()
      );

      RepositoryService.trackNFTs.push(trackNFT);

      // Create repository notice for TrackNFT minting
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "track_nft_minted",
        trackNFT
      );

      // Also create specific NFT notice
      const nftNotice = RepositoryService.createDataNotice(
        "trackNFTs",
        "minted",
        trackNFT
      );

      return repositoryNotice;
    } catch (error) {
      return new Error_out(`Failed to mint TrackNFT: ${error}`);
    }
  }

  /**
   * Mint ArtistTokens (ERC1155) for a specific track
   */
  mintArtistTokens(mintData: IMintArtistTokens) {
    if (
      !mintData.walletAddress ||
      !mintData.trackId ||
      !mintData.amount ||
      !mintData.pricePerToken
    ) {
      return new Error_out("Missing required fields for ArtistToken minting");
    }

    const config = this.configService.getConfig();
    if (!config) {
      return new Error_out("Failed to get configuration");
    }

    if (!config.artistTokenContractAddress) {
      return new Error_out("ArtistToken contract address not configured");
    }

    try {
      // Comment out voucher creation since we're interacting with contracts directly
      // const callData = encodeFunctionData({
      //   abi: ArtistTokenABI,
      //   functionName: "mintArtistTokens",
      //   args: [
      //     mintData.trackId,
      //     mintData.walletAddress, // artistWallet
      //     BigInt(mintData.amount),
      //     parseEther(mintData.pricePerToken.toString()),
      //   ],
      // });

      // const voucher = new Voucher(
      //   config.artistTokenContractAddress,
      //   hexToBytes(callData)
      // );

      // Store artist token data in repository using the model
      const artistToken = new ArtistToken(
        mintData.walletAddress,
        mintData.trackId,
        mintData.amount,
        mintData.pricePerToken,
        mintData.createdAt || Date.now()
      );

      RepositoryService.artistTokens.push(artistToken);

      // Create repository notice for ArtistToken minting
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "artist_tokens_minted",
        artistToken
      );

      // Also create specific NFT notice
      const nftNotice = RepositoryService.createDataNotice(
        "artistTokens",
        "minted",
        artistToken
      );

      return repositoryNotice;
    } catch (error) {
      return new Error_out(`Failed to mint ArtistTokens: ${error}`);
    }
  }

  /**
   * Purchase ArtistTokens from another user
   */
  purchaseArtistTokens(purchaseData: IPurchaseArtistTokens) {
    if (
      !purchaseData.buyerAddress ||
      !purchaseData.trackId ||
      !purchaseData.amount ||
      !purchaseData.totalPrice
    ) {
      return new Error_out("Missing required fields for ArtistToken purchase");
    }

    const config = this.configService.getConfig();
    if (!config) {
      return new Error_out("Failed to get configuration");
    }

    if (!config.artistTokenContractAddress) {
      return new Error_out("ArtistToken contract address not configured");
    }

    if (!config.cartesiTokenContractAddress) {
      return new Error_out("CTSI token contract address not configured");
    }

    // Find the artist token to check availability
    const artistToken = RepositoryService.artistTokens.find(
      (token) => token.trackId === purchaseData.trackId && token.isActive
    );

    if (!artistToken) {
      return new Error_out("Artist token not found or not active");
    }

    // Validate sufficient supply
    if (artistToken.availableSupply < purchaseData.amount) {
      return new Error_out(
        `Insufficient supply available. Available: ${artistToken.availableSupply}, Requested: ${purchaseData.amount}`
      );
    }

    try {
      // Comment out voucher creation since we're interacting with contracts directly
      // const callData = encodeFunctionData({
      //   abi: ArtistTokenABI,
      //   functionName: "purchaseTokens",
      //   args: [
      //     BigInt(purchaseData.trackId), // tokenId based on trackId
      //     BigInt(purchaseData.amount),
      //     purchaseData.buyerAddress, // buyer address to receive tokens
      //   ],
      // });

      // const voucher = new Voucher(
      //   config.artistTokenContractAddress,
      //   hexToBytes(callData)
      // );

      // Update available supply in the repository
      artistToken.availableSupply -= purchaseData.amount;

      // Update repository with purchase data using the model
      const purchase = new ArtistTokenPurchase(
        purchaseData.buyerAddress,
        purchaseData.trackId,
        purchaseData.amount,
        purchaseData.totalPrice,
        purchaseData.createdAt || Date.now()
      );

      RepositoryService.artistTokenPurchases.push(purchase);

      // Create repository notice for ArtistToken purchase
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "artist_tokens_purchased",
        purchase
      );

      // Also create specific NFT notice
      const nftNotice = RepositoryService.createDataNotice(
        "artistTokenPurchases",
        "purchased",
        purchase
      );

      return repositoryNotice;
    } catch (error) {
      return new Error_out(`Failed to purchase ArtistTokens: ${error}`);
    }
  }

  /**
   * Get TrackNFT information by track ID
   */
  getTrackNFT(trackId: string) {
    const trackNFT = RepositoryService.trackNFTs.find(
      (nft) => nft.trackId === trackId
    );
    if (!trackNFT) {
      return new Error_out(`TrackNFT not found for track ID: ${trackId}`);
    }

    return trackNFT;
  }

  /**
   * Get ArtistToken information by track ID and owner
   */
  getArtistTokens(trackId: string, owner: string) {
    const artistTokens = RepositoryService.artistTokens.find(
      (token) => token.trackId === trackId && token.owner === owner
    );
    if (!artistTokens) {
      return new Error_out(
        `ArtistTokens not found for track ID: ${trackId} and owner: ${owner}`
      );
    }

    return artistTokens;
  }

  /**
   * Get all purchase history for ArtistTokens
   */
  getArtistTokenPurchases() {
    return RepositoryService.artistTokenPurchases;
  }
}

export { NFTService };
export type { IMintTrackNFT, IMintArtistTokens, IPurchaseArtistTokens };
