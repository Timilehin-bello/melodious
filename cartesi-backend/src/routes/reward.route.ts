import { AdvanceRoute, DefaultRoute, WalletRoute } from "cartesi-router";
import { Error_out, Notice, Output, Voucher } from "cartesi-wallet";

import {
  ListeningRewardController,
  ReferralRewardController,
} from "../controllers";

class ListeningRewardRoute extends AdvanceRoute {
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
      console.log("Executing deposit reward request by", this.msg_sender);
      const reward =
        this.reward.distributeRewardToArtistsBasedOnTotalTrackListens(
          this.request_args.artistsTotalTrackListenTime,
          this.msg_sender
        );

      return reward;
    } catch (error) {
      const error_msg = `Failed to create reward ${error}`;
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
  ListeningRewardRoute,
  ReferralRewardRoute,
  //   rewardsRoute,
  //   rewardRoute,
};
