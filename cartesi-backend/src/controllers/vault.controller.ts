import { Error_out, Voucher } from "cartesi-wallet";
import { IDeposit } from "../interfaces";
import { UserController } from "./user.controller";
import { encodeFunctionData, hexToBytes, parseEther } from "viem";
import {
  ctsiTokenConfigABI,
  MelodiousVaultConfigABI,
  networkConfig,
} from "../configs";
import { ConfigService } from "../services";

class VaultController {
  constructor() {}

  public depositToVault(depositBody: IDeposit) {
    if (!depositBody.walletAddress || !depositBody.depositAmount) {
      return new Error_out("Missing required fields");
    }

    console.log("depositBody", depositBody);

    const getConfigService = new ConfigService().getConfig();

    console.log("getConfigService", getConfigService);

    if (!getConfigService) {
      return new Error_out("Failed to get configuration");
    }

    const depositAmountInWei = Number(
      parseEther(depositBody.depositAmount.toString())
    );

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

      getConfigService.vaultBalance += Number(depositBody.depositAmount);

      return voucher;
    } catch (error) {
      console.debug("Error depositing funds", error);
      return new Error_out("Failed to deposit funds");
    }
  }

  public withdraw() {
    // if()

    try {
    } catch (error) {}
  }

  public getBalance() {}
}

export { VaultController };