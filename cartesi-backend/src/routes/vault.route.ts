import { AdvanceRoute, DefaultRoute, WalletRoute } from "cartesi-router";
import { Error_out, Notice, Output } from "cartesi-wallet";

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
      console.log(
        "Executing deposit vault request",
        this.request_args.depositAmount
      );
      const vault = this.vault.depositToVault({
        walletAddress: this.msg_sender,
        depositAmount: this.request_args.depositAmount,
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
  //   VaultsRoute,
  //   VaultRoute,
};
