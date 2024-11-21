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

  updateArtistsListeningTime(artistsListeningBody: IListeningReward[]) {
    if (!artistsListeningBody || artistsListeningBody.length === 0) {
      return new Error_out("No artists listening data found");
    }
    const listeningRewardService =
      new ListeningRewardService().updateListeningTimeOfArtist(
        artistsListeningBody
      );

    if (!listeningRewardService) {
      return new Error_out("Failed to update artists listening time");
    }

    const notice_payload = `{{"type":"update_artists_listening_time","content": "Artists listening time updated successfully"}}}`;
    return new Notice(notice_payload);
  }
}

class ReferralRewardController {}

export { ListeningRewardController, ReferralRewardController };
