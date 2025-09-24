import { Error_out, Log, Voucher } from "cartesi-wallet";
import { NFTService } from "../services";
import type {
  IMintTrackNFT,
  IMintArtistTokens,
  IPurchaseArtistTokens,
} from "../services/nft.service";

class NFTController {
  private nftService: NFTService;

  constructor() {
    this.nftService = new NFTService();
  }

  /**
   * Mint a TrackNFT (ERC721) for a specific track
   */
  public mintTrackNFT(mintData: IMintTrackNFT) {
    if (!mintData.walletAddress || !mintData.trackId || !mintData.ipfsHash) {
      return new Error_out(
        "Missing required fields: walletAddress, trackId, ipfsHash"
      );
    }

    if (
      typeof mintData.royaltyPercentage !== "number" ||
      mintData.royaltyPercentage < 0 ||
      mintData.royaltyPercentage > 100
    ) {
      return new Error_out(
        "Invalid royalty percentage. Must be between 0 and 100"
      );
    }

    console.log("Minting TrackNFT", {
      walletAddress: mintData.walletAddress,
      trackId: mintData.trackId,
      ipfsHash: mintData.ipfsHash,
      royaltyPercentage: mintData.royaltyPercentage,
    });

    try {
      const result = this.nftService.mintTrackNFT(mintData);

      if (result instanceof Error_out) {
        return result;
      }

      return result;
    } catch (error) {
      const error_msg = `Failed to mint TrackNFT: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Mint ArtistTokens (ERC1155) for a specific track
   */
  public mintArtistTokens(mintData: IMintArtistTokens) {
    if (
      !mintData.walletAddress ||
      !mintData.trackId ||
      !mintData.amount ||
      !mintData.pricePerToken
    ) {
      return new Error_out(
        "Missing required fields: walletAddress, trackId, amount, pricePerToken"
      );
    }

    if (mintData.amount <= 0) {
      return new Error_out("Amount must be greater than 0");
    }

    if (mintData.pricePerToken <= 0) {
      return new Error_out("Price per token must be greater than 0");
    }

    console.log("Minting ArtistTokens", {
      walletAddress: mintData.walletAddress,
      trackId: mintData.trackId,
      amount: mintData.amount,
      pricePerToken: mintData.pricePerToken,
    });

    try {
      const result = this.nftService.mintArtistTokens(mintData);

      if (result instanceof Error_out) {
        return result;
      }

      return result;
    } catch (error) {
      const error_msg = `Failed to mint ArtistTokens: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Purchase ArtistTokens from another user
   */
  public purchaseArtistTokens(purchaseData: IPurchaseArtistTokens) {
    if (
      !purchaseData.buyerAddress ||
      !purchaseData.trackId ||
      !purchaseData.amount ||
      !purchaseData.totalPrice
    ) {
      return new Error_out(
        "Missing required fields: buyerAddress, trackId, amount, totalPrice"
      );
    }

    if (purchaseData.amount <= 0) {
      return new Error_out("Amount must be greater than 0");
    }

    if (purchaseData.totalPrice <= 0) {
      return new Error_out("Total price must be greater than 0");
    }

    console.log("Purchasing ArtistTokens", {
      buyerAddress: purchaseData.buyerAddress,
      trackId: purchaseData.trackId,
      amount: purchaseData.amount,
      totalPrice: purchaseData.totalPrice,
    });

    try {
      const result = this.nftService.purchaseArtistTokens(purchaseData);

      if (result instanceof Error_out) {
        return result;
      }

      return result;
    } catch (error) {
      const error_msg = `Failed to purchase ArtistTokens: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Get TrackNFT information by track ID
   */
  public getTrackNFT(trackId: string) {
    if (!trackId) {
      return new Error_out("Track ID is required");
    }

    try {
      const result = this.nftService.getTrackNFT(trackId);

      if (result instanceof Error_out) {
        return result;
      }

      const trackNFTJson = JSON.stringify(result);
      console.log("TrackNFT", trackNFTJson);
      return new Log(trackNFTJson);
    } catch (error) {
      const error_msg = `Failed to get TrackNFT: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Get ArtistToken information by track ID and owner
   */
  public getArtistTokens(trackId: string, owner: string) {
    if (!trackId || !owner) {
      return new Error_out("Track ID and owner address are required");
    }

    try {
      const result = this.nftService.getArtistTokens(trackId, owner);

      if (result instanceof Error_out) {
        return result;
      }

      const artistTokensJson = JSON.stringify(result);
      console.log("ArtistTokens", artistTokensJson);
      return new Log(artistTokensJson);
    } catch (error) {
      const error_msg = `Failed to get ArtistTokens: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Get all ArtistToken purchase history
   */
  public getArtistTokenPurchases() {
    try {
      const result = this.nftService.getArtistTokenPurchases();
      const purchasesJson = JSON.stringify(result);
      console.log("ArtistToken purchases", purchasesJson);
      return new Log(purchasesJson);
    } catch (error) {
      const error_msg = `Failed to get ArtistToken purchases: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }

  /**
   * Get NFT statistics
   */
  public getNFTStats() {
    try {
      // This could be expanded to provide comprehensive NFT statistics
      const purchases = this.nftService.getArtistTokenPurchases();

      const stats = {
        totalPurchases: purchases.length,
        totalVolume: purchases.reduce(
          (sum: number, purchase: any) => sum + purchase.totalPrice,
          0
        ),
        uniqueBuyers: new Set(purchases.map((purchase: any) => purchase.buyer))
          .size,
        uniqueTracks: new Set(
          purchases.map((purchase: any) => purchase.trackId)
        ).size,
        timestamp: Date.now(),
      };

      const statsJson = JSON.stringify(stats);
      console.log("NFT stats", statsJson);
      return new Log(statsJson);
    } catch (error) {
      const error_msg = `Failed to get NFT stats: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  }
}

export { NFTController };
