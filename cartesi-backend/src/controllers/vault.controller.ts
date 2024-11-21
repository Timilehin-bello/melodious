import { Error_out, Log, Voucher } from "cartesi-wallet";
import { IDeposit, IWithdrawal } from "../interfaces";
import { encodeFunctionData, hexToBytes, parseEther } from "viem";
import { ctsiTokenConfigABI, MelodiousVaultConfigABI } from "../configs";
import { ConfigService, ListeningRewardService } from "../services";
import { UserController } from "./user.controller";

class VaultController {
  constructor() {}

  public depositToVault(depositBody: IDeposit) {
    if (!depositBody.walletAddress || !depositBody.amount) {
      return new Error_out("Missing required fields");
    }

    console.log("depositBody", depositBody);

    const getConfigService = new ConfigService().getConfig();

    console.log("getConfigService", getConfigService);

    if (!getConfigService) {
      return new Error_out("Failed to get configuration");
    }

    //TODO: check why the amount in vault is not correspoding to the expected amount
    const depositAmountInWei = Number(
      parseEther(depositBody.amount.toString())
    );

    console.log("depositAmountInWei", depositAmountInWei);

    try {
      const callData = encodeFunctionData({
        abi: ctsiTokenConfigABI,
        functionName: "transfer",
        args: [getConfigService.vaultContractAddress, depositAmountInWei],
      });

      console.log("callData", callData);

      const voucher = new Voucher(
        getConfigService.cartesiTokenContractAddress,
        hexToBytes(callData)
      );
      console.log("voucher", voucher);

      getConfigService.vaultBalance += depositBody.amount;

      return voucher;
    } catch (error) {
      console.debug("Error depositing funds", error);
      return new Error_out("Failed to deposit funds");
    }
  }

  public withdraw(withdrawBody: IWithdrawal) {
    if (!withdrawBody.walletAddress || !withdrawBody.amount) {
      return new Error_out("Missing required fields");
    }
    const listeningRewardService =
      new ListeningRewardService().withdrawListeningReward(withdrawBody);

    if (listeningRewardService instanceof Error_out) {
      return listeningRewardService;
    }

    const user = new UserController().getUserByUniqueValue({
      key: "walletAddress",
      value: withdrawBody.walletAddress.toLowerCase(),
    });

    if (!user) {
      return new Error_out(
        `User with wallet address ${withdrawBody.walletAddress} does not exist`
      );
    }

    const getConfigService = new ConfigService().getConfig();

    if (!getConfigService) {
      return new Error_out("Failed to get configuration");
    }

    //TODO: check why the amount in vault is not correspoding to the expected amount
    const withdrawalAmountInWei = Number(
      parseEther(withdrawBody.amount.toString())
    );

    if (!listeningRewardService) {
      user.cartesiTokenBalance += withdrawBody.amount;
      return new Error_out("Failed to withdraw funds");
    }

    try {
      const callData = encodeFunctionData({
        abi: MelodiousVaultConfigABI,
        functionName: "withdraw",
        args: [withdrawBody.walletAddress, withdrawalAmountInWei],
      });

      console.log("callData", callData);

      const voucher = new Voucher(
        getConfigService.vaultContractAddress,
        hexToBytes(callData)
      );

      console.log("voucher", voucher);

      getConfigService.vaultBalance -= withdrawBody.amount;

      //TODO: Check later if this gives the expected value
      getConfigService.lastVaultBalanceDistributed -= withdrawBody.amount;

      return voucher;
    } catch (error) {
      console.debug("Error withdrawing funds", error);
      return new Error_out("Failed to withdraw funds");
    }
  }

  public getBalance() {
    const getConfigService = new ConfigService().getConfig();
    if (!getConfigService) return new Error_out("Failed to get configuration");
    try {
      const vaultBalance = getConfigService.vaultBalance;
      const vaultBalance_json = JSON.stringify(vaultBalance);
      console.log("vaultBalance", vaultBalance_json);
      return new Log(vaultBalance_json);
    } catch (error) {
      console.debug("Error getting vault balance", error);
      return new Error_out("Failed to get vault balance");
    }
  }
}

export { VaultController };
