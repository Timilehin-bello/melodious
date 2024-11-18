import { Error_out, Notice } from "cartesi-wallet";
import { IListeningReward } from "../interfaces";
import { ConfigService, ListeningRewardService } from "../services";

class ListeningRewardController {
  distributeRewardToArtistsBasedOnTotalTrackListens(
    artistsListeningBody: IListeningReward[],
    adminWalletAddress: string
  ) {
    if (!artistsListeningBody || artistsListeningBody.length === 0) {
      return new Error_out("No artists listening data found");
    }

    if (!adminWalletAddress) {
      return new Error_out("Admin wallet address is required");
    }

    const getConfigService = new ConfigService().getConfig();

    if (!getConfigService) {
      return new Error_out("Failed to get configuration");
    }

    if (
      !getConfigService.adminWalletAddresses.some(
        (address) => address.toLowerCase() === adminWalletAddress.toLowerCase()
      )
    ) {
      return new Error_out(
        `Admin wallet address ${adminWalletAddress} is not authorized to run this command`
      );
    }

    const rewardPayoutService =
      new ListeningRewardService().calculateArtistRewardBaseOnListeningTime(
        artistsListeningBody
      );

    if (rewardPayoutService instanceof Error_out) {
      return rewardPayoutService;
    }

    const notice_payload = `{{"type":"distribute_reward_to_artists","content": "Reward distributed successfully"}}}`;
    return new Notice(notice_payload);
  }
}

class ReferralRewardController {}

export { ListeningRewardController, ReferralRewardController };
