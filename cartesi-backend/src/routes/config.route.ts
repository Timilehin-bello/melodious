import { AdvanceRoute, DefaultRoute, WalletRoute } from "cartesi-router";
import { Error_out, Notice, Output } from "cartesi-wallet";

import { ConfigController } from "../controllers";

class CreateConfigRoute extends AdvanceRoute {
  config: ConfigController;
  constructor(config: ConfigController) {
    super();
    this.config = config;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      console.log("Executing create config request");
      const {
        signer,
        vaultBalance,
        lastVaultBalanceDistributed,
        feeBalance,
        ...request_payload
      } = this.request_args;

      const config = this.config.createConfig({
        ...request_payload,
        vaultBalance: 0,
        lastVaultBalanceDistributed: 0,
        feeBalance: 0,
      });

      return config;
    } catch (error) {
      const error_msg = `Failed to create config ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class UpdateConfigRoute extends AdvanceRoute {
  config: ConfigController;
  constructor(config: ConfigController) {
    super();
    this.config = config;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      console.log("Executing update config request");
      const config = this.config.updateConfig({
        ...this.request_args,
      });

      return config;
    } catch (error) {
      const error_msg = `Failed to create config ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class InspectRoute extends DefaultRoute {
  config: ConfigController;
  constructor(config: ConfigController) {
    super();
    this.config = config;
  }
}

class ConfigsRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.config.getConfig();
  };
}

export { CreateConfigRoute, UpdateConfigRoute, ConfigsRoute };
