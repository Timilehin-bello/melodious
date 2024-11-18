import { AdvanceRoute, DefaultRoute, WalletRoute } from "cartesi-router";
import { Error_out, Notice, Output, Voucher } from "cartesi-wallet";

import { VaultController } from "../controllers";

class DepositVaultRoute extends AdvanceRoute {
  vault: VaultController;
  constructor(vault: VaultController) {
    super();
    this.vault = vault;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      console.log("Executing deposit vault request", this.request_args.amount);
      const vault = this.vault.depositToVault({
        walletAddress: this.msg_sender,
        amount: this.request_args.amount,
      });

      return vault;
    } catch (error) {
      const error_msg = `Failed to create vault ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class WithdrawalArtistVaultRoute extends AdvanceRoute {
  vault: VaultController;
  constructor(vault: VaultController) {
    super();
    this.vault = vault;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      console.log(
        "Executing artist withdrawal vault request",
        this.request_args.amount
      );
      const vault = this.vault.withdraw({
        walletAddress: this.msg_sender,
        amount: this.request_args.amount,
      });

      return vault;
    } catch (error) {
      const error_msg = `Failed to create vault ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

// class InspectRoute extends DefaultRoute {
//   vault: VaultController;
//   constructor(vault: VaultController) {
//     super();
//     this.vault = vault;
//   }
// }

// class VaultsRoute extends InspectRoute {
//   execute = (request: any): Output => {
//     return this.vault.getvaults();
//   };
// }

// class VaultRoute extends InspectRoute {
//   execute = (request: any): Output => {
//     return this.vault.getvault(parseInt(<string>request));
//   };
// }

export {
  DepositVaultRoute,
  WithdrawalArtistVaultRoute,
  //   VaultsRoute,
  //   VaultRoute,
};
