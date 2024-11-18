import { Error_out } from "cartesi-wallet";
import { IListeningReward, IWithdrawal } from "../interfaces";
import { ConfigService } from "./config.service";
import { ArtistController, UserController } from "../controllers";
import { RepositoryService } from "./repository.service";

class ListeningRewardService {
  calculateArtistRewardBaseOnListeningTime(
    ListeningRewardBody: IListeningReward[]
  ) {
    const getConfigService = new ConfigService().getConfig();

    if (!getConfigService) {
      return new Error_out("Failed to get configuration");
    }

    const totalCummulativeListeningTime = ListeningRewardBody.reduce(
      (total, { totalListeningTime }) => total + totalListeningTime,
      0
    );

    if (totalCummulativeListeningTime === 0) {
      return new Error_out("Total listening time cannot be zero");
    }

    const artistTokenAllocation =
      (getConfigService.vaultBalance * getConfigService.artistPercentage) / 100;

    ListeningRewardBody.forEach(({ walletAddress, totalListeningTime }) => {
      console.log("totalListeningTime", totalListeningTime);
      const user = new UserController().getUserByUniqueValue({
        key: "walletAddress",
        value: walletAddress.toLowerCase(),
      });

      if (!user || user.artist === null) {
        return new Error_out("User with wallet address does not exist ");
      }

      const artist = new ArtistController().getArtistByUserId(user.id);

      if (!artist) {
        return new Error_out(`Artist with user ID ${user.id} does not exist`);
      }

      const artistRewardAmount =
        (totalListeningTime / totalCummulativeListeningTime) *
        artistTokenAllocation;

      //TODO: The total listening time is not getting updated correctly
      user.artist.totalListeningTime += totalListeningTime;
      console.log("Artists ", JSON.stringify(RepositoryService.artists));

      user.cartesiTokenBalance += artistRewardAmount;
    });
    return true;
  }

  withdrawListeningReward(withdrawalRewardBody: IWithdrawal) {
    const user = new UserController().getUserByUniqueValue({
      key: "walletAddress",
      value: withdrawalRewardBody.walletAddress.toLowerCase(),
    });

    if (!user || user.artist === null) {
      return new Error_out(
        `User with wallet address ${withdrawalRewardBody.walletAddress} does not exist or is not an artist`
      );
    }

    const artist = new ArtistController().getArtistByUserId(user.id);

    if (!artist) {
      return new Error_out(`Artist with user ID ${user.id} does not exist`);
    }

    const getConfigService = new ConfigService().getConfig();

    if (!getConfigService) {
      return new Error_out("Failed to get configuration");
    }

    if (withdrawalRewardBody.amount <= 0) {
      return new Error_out("Amount must be greater than zero");
    }

    if (withdrawalRewardBody.amount > user.cartesiTokenBalance) {
      return new Error_out("Insufficient balance for withdrawal");
    }

    if (getConfigService.vaultBalance < withdrawalRewardBody.amount) {
      return new Error_out("Insufficient vault balance for withdrawal");
    }

    // Deduct the amount from the user's balance
    user.cartesiTokenBalance -= withdrawalRewardBody.amount;

    // Simulate transferring tokens from the vault
    //     getConfigService.vaultBalance -= withdrawalRewardBody.amount;

    return true;
  }
}

class ReferralRewardService {}

export { ListeningRewardService, ReferralRewardService };
