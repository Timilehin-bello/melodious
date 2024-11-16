import { Error_out } from "cartesi-wallet";
import { IListeningReward, IWithdrawal } from "../interfaces";
import { ConfigService } from "./config.service";
import { ArtistController, UserController } from "../controllers";

class ListeningRewardService {
  calculateArtistRewardBaseOnListeningTime(
    ListeningRewardBody: IListeningReward[]
  ) {
    const totalCummulativeListeningTime = ListeningRewardBody.reduce(
      (total, { totalListeningTime }) => total + totalListeningTime,
      0
    );

    if (totalCummulativeListeningTime === 0) {
      return new Error_out("Total listening time cannot be zero");
    }

    const getConfig = new ConfigService().getConfig();

    if (!getConfig) {
      return new Error_out("Failed to get configuration");
    }

    const artistTokenAllocation =
      (getConfig.vaultBalance * getConfig.artistPercentage) / 100;

    ListeningRewardBody.forEach(({ walletAddress, totalListeningTime }) => {
      const user = new UserController().getUserByUniqueValue({
        key: "walletAddress",
        value: walletAddress.toLowerCase(),
      });

      if (!user || user.artist === null) {
        return new Error_out("User with wallet address does not exist");
      }

      const artist = new ArtistController().getArtistByUserId(user.id);

      if (!artist) {
        return new Error_out(`Artist with user ID ${user.id} does not exist`);
      }

      const artistRewardAmount =
        (totalListeningTime / totalCummulativeListeningTime) *
        artistTokenAllocation;

      artist.totalListeningTime += totalListeningTime;
      user.artist.totalListeningTime += totalListeningTime;

      user.cartesiTokenBalance += artistRewardAmount;
    });
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

    const getConfig = new ConfigService().getConfig();

    if (!getConfig) {
      return new Error_out("Failed to get configuration");
    }

    if (withdrawalRewardBody.amount <= 0) {
      return new Error_out("Amount must be greater than zero");
    }

    if (withdrawalRewardBody.amount > user.cartesiTokenBalance) {
      return new Error_out("Insufficient balance for withdrawal");
    }

    // Deduct the amount from the user's balance
    user.cartesiTokenBalance -= withdrawalRewardBody.amount;

    // Simulate transferring tokens from the vault
    getConfig.vaultBalance -= withdrawalRewardBody.amount;
  }
}

class ReferralRewardService {}

export { ListeningRewardService, ReferralRewardService };
