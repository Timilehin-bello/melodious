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

    const totalVaultBalance = getConfigService.vaultBalance;
    const lastDistributedBalance =
      getConfigService.lastVaultBalanceDistributed || 0;

    if (totalVaultBalance <= lastDistributedBalance) {
      return new Error_out("No new funds to distribute");
    }

    const amountToDistribute = totalVaultBalance - lastDistributedBalance;

    const artistTokenAllocation =
      (amountToDistribute * getConfigService.artistPercentage) / 100;

    const totalCumulativeListeningTime = ListeningRewardBody.reduce(
      (total, { totalListeningTime }) => total + totalListeningTime,
      0
    );

    // const totalCumulativeListeningTimeOfArtistAfterDistribution = RepositoryService.artists.reduce(
    //   (total, artist) => total + artist.totalListeningTime,
    //   0)

    if (totalCumulativeListeningTime === 0) {
      return new Error_out("Total listening time cannot be zero");
    }

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
        (totalListeningTime / totalCumulativeListeningTime) *
        artistTokenAllocation;

      const feeAmount =
        (artistRewardAmount * getConfigService.feePercentage) / 100;

      getConfigService.feeBalance += feeAmount;

      const netArtistReward = artistRewardAmount - feeAmount;

      user.artist.totalListeningTime += totalListeningTime;
      user.cartesiTokenBalance += netArtistReward;
    });

    getConfigService.lastVaultBalanceDistributed = totalVaultBalance;

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
