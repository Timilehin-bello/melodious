import { AdvanceRoute, DefaultRoute, WalletRoute } from "cartesi-router";
import { Error_out, Notice, Output, Voucher } from "cartesi-wallet";

import {
  ListeningRewardController,
  ReferralRewardController,
} from "../controllers";
import { RepositoryService } from "../services";

class ArtistDistributionRewardRoute extends AdvanceRoute {
  reward: ListeningRewardController;
  constructor(reward: ListeningRewardController) {
    super();
    this.reward = reward;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      const getConfig = RepositoryService.config;
      if (!getConfig) {
        return new Error_out("Config not found. Please create it first.");
      }
      let { signer, ...request_payload } = this.request_args;
      if (!signer) {
        signer = this.msg_sender;
      }

      console.log("getConfig", getConfig);

      console.log("msg_sender in reward route is", this.msg_sender);
      console.log(
        "Executing Create Reward request",
        JSON.stringify(this.request_args)
      );
      console.log("signer", signer);

      if (
        !getConfig.adminWalletAddresses.some(
          (address) => address.toLowerCase() === signer.toLowerCase()
        )
      ) {
        return new Error_out(
          `Admin wallet address ${signer} is not authorized to run this command`
        );
      }
      console.log("Executing deposit reward request by", this.msg_sender);
      const reward =
        this.reward.distributeRewardToArtistsBasedOnTotalTrackListens(
          request_payload.artistsTotalTrackListenTime,
          signer
        );

      return reward;
    } catch (error) {
      const error_msg = `Failed to create reward ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class UpdateArtistListeningTimeForRewardRoute extends AdvanceRoute {
  reward: ListeningRewardController;
  constructor(reward: ListeningRewardController) {
    super();
    this.reward = reward;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);
    try {
      const getConfig = RepositoryService.config;
      if (!getConfig) {
        return new Error_out("Config not found. Please create it first.");
      }

      let { signer, ...request_payload } = this.request_args;
      if (!signer) {
        signer = this.msg_sender;
      }

      console.log("getConfig", getConfig);

      console.log("msg_sender in reward route is", this.msg_sender);
      console.log(
        "Executing Create Reward request",
        JSON.stringify(this.request_args)
      );
      console.log("signer", signer);

      if (
        !getConfig.adminWalletAddresses.some(
          (address) => address.toLowerCase() === signer.toLowerCase()
        )
      ) {
        return new Error_out(
          `Admin wallet address ${signer} is not authorized to run this command`
        );
      }
      console.log("Executing update reward request by", signer);
      const reward = this.reward.updateArtistsListeningTime(
        request_payload.artistsTotalTrackListenTime
      );
      return reward;
    } catch (error) {
      const error_msg = `Failed to update reward ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class ReferralRewardRoute extends AdvanceRoute {
  reward: ReferralRewardController;
  constructor(reward: ReferralRewardController) {
    super();
    this.reward = reward;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
}

export {
  ArtistDistributionRewardRoute,
  UpdateArtistListeningTimeForRewardRoute,
  ReferralRewardRoute,

  //   rewardsRoute,
  //   rewardRoute,
};
