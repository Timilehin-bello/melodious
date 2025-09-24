import { AdvanceRoute, DefaultRoute } from "cartesi-router";
import { Error_out, Notice, Output } from "cartesi-wallet";
import { NFTController } from "../controllers";

class MintTrackNFTRoute extends AdvanceRoute {
  nft: NFTController;

  constructor(nft: NFTController) {
    super();
    this.nft = nft;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);

    let { signer, ...request_payload } = this.request_args;
    if (!signer) {
      signer = this.msg_sender;
    }

    try {
      console.log("Executing mint TrackNFT request", {
        signer,
        trackId: request_payload.trackId,
        ipfsHash: request_payload.ipfsHash,
        royaltyPercentage: request_payload.royaltyPercentage,
      });

      const result = this.nft.mintTrackNFT({
        walletAddress: signer,
        trackId: request_payload.trackId,
        ipfsHash: request_payload.ipfsHash,
        royaltyPercentage: request_payload.royaltyPercentage || 0,
      });

      return result;
    } catch (error) {
      const error_msg = `Failed to mint TrackNFT: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class MintArtistTokensRoute extends AdvanceRoute {
  nft: NFTController;

  constructor(nft: NFTController) {
    super();
    this.nft = nft;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);

    let { signer, ...request_payload } = this.request_args;
    if (!signer) {
      signer = this.msg_sender;
    }

    try {
      console.log("Executing mint ArtistTokens request", {
        signer,
        trackId: request_payload.trackId,
        amount: request_payload.amount,
        pricePerToken: request_payload.pricePerToken,
      });

      const result = this.nft.mintArtistTokens({
        walletAddress: signer,
        trackId: request_payload.trackId,
        amount: request_payload.amount,
        pricePerToken: request_payload.pricePerToken,
      });

      return result;
    } catch (error) {
      const error_msg = `Failed to mint ArtistTokens: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class PurchaseArtistTokensRoute extends AdvanceRoute {
  nft: NFTController;

  constructor(nft: NFTController) {
    super();
    this.nft = nft;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);

    let { signer, ...request_payload } = this.request_args;
    if (!signer) {
      signer = this.msg_sender;
    }

    try {
      console.log("Executing purchase ArtistTokens request", {
        buyer: signer,
        trackId: request_payload.trackId,
        amount: request_payload.amount,
        totalPrice: request_payload.totalPrice,
      });

      const result = this.nft.purchaseArtistTokens({
        buyerAddress: signer,
        trackId: request_payload.trackId,
        amount: request_payload.amount,
        totalPrice: request_payload.totalPrice,
      });

      return result;
    } catch (error) {
      const error_msg = `Failed to purchase ArtistTokens: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  };
}

// Inspect routes for reading data
class InspectRoute extends DefaultRoute {
  nft: NFTController;
  constructor(nft: NFTController) {
    super();
    this.nft = nft;
  }
}

class GetTrackNFTRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.nft.getTrackNFT(request as string);
  };
}

class GetArtistTokensRoute extends InspectRoute {
  execute = (request: any): Output => {
    const { trackId, owner } = request;
    return this.nft.getArtistTokens(trackId, owner);
  };
}

class GetArtistTokenPurchasesRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.nft.getArtistTokenPurchases();
  };
}

class GetNFTStatsRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.nft.getNFTStats();
  };
}

export {
  MintTrackNFTRoute,
  MintArtistTokensRoute,
  PurchaseArtistTokensRoute,
  GetTrackNFTRoute,
  GetArtistTokensRoute,
  GetArtistTokenPurchasesRoute,
  GetNFTStatsRoute,
};
