import { WalletRoute } from "cartesi-router";
import { Error_out, Wallet } from "cartesi-wallet";
import { WithdrawalController } from "../controllers";
import { VoucherV2 } from "../services/withdrawal.service";

class EtherWithdrawalRoute extends WalletRoute {
  withdrawalController: WithdrawalController;

  constructor(withdrawalController: WithdrawalController, wallet: Wallet) {
    super(wallet);
    this.withdrawalController = withdrawalController;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);

    let { signer, ...request_payload } = this.request_args;
    if (!signer) {
      signer = this.msg_sender;
    }

    try {
      console.log("Executing Ether withdrawal request", {
        signer,
        amount: request_payload.amount,
      });

      const result = this.withdrawalController.withdrawEther({
        walletAddress: signer,
        amount: request_payload.amount,
        timestamp: request_payload.timestamp,
      });

      // Return VoucherV2 directly - it already has the correct type property
      return result;
    } catch (error) {
      const error_msg = `Failed to process Ether withdrawal: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class ERC20WithdrawalRoute extends WalletRoute {
  withdrawalController: WithdrawalController;

  constructor(withdrawalController: WithdrawalController, wallet: Wallet) {
    super(wallet);
    this.withdrawalController = withdrawalController;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);

    let { signer, ...request_payload } = this.request_args;
    if (!signer) {
      signer = this.msg_sender;
    }

    try {
      console.log("Executing ERC-20 withdrawal request", {
        signer,
        amount: request_payload.amount,
        tokenAddress: request_payload.tokenAddress,
      });

      const result = this.withdrawalController.withdrawERC20({
        walletAddress: signer,
        amount: request_payload.amount,
        tokenAddress: request_payload.tokenAddress,
        timestamp: request_payload.timestamp,
      });

      return result;
    } catch (error) {
      const error_msg = `Failed to process ERC-20 withdrawal: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class ERC721WithdrawalRoute extends WalletRoute {
  withdrawalController: WithdrawalController;

  constructor(withdrawalController: WithdrawalController, wallet: Wallet) {
    super(wallet);
    this.withdrawalController = withdrawalController;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);

    let { signer, ...request_payload } = this.request_args;
    if (!signer) {
      signer = this.msg_sender;
    }

    try {
      console.log("Executing ERC-721 withdrawal request", {
        signer,
        tokenId: request_payload.tokenId,
        tokenAddress: request_payload.tokenAddress,
      });

      const result = this.withdrawalController.withdrawERC721({
        walletAddress: signer,
        tokenId: request_payload.tokenId,
        tokenAddress: request_payload.tokenAddress,
        timestamp: request_payload.timestamp,
      });

      return result;
    } catch (error) {
      const error_msg = `Failed to process ERC-721 withdrawal: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class WithdrawalHistoryRoute extends WalletRoute {
  withdrawalController: WithdrawalController;

  constructor(withdrawalController: WithdrawalController, wallet: Wallet) {
    super(wallet);
    this.withdrawalController = withdrawalController;
  }

  _parse_request(request: any) {
    this.parse_request(request);
  }

  public execute = (request: any) => {
    this._parse_request(request);

    let { signer, ...request_payload } = this.request_args;
    if (!signer) {
      signer = this.msg_sender;
    }

    try {
      console.log("Fetching withdrawal history for", signer);

      const result = this.withdrawalController.getWithdrawalHistory(
        request_payload.walletAddress || signer
      );

      return result;
    } catch (error) {
      const error_msg = `Failed to fetch withdrawal history: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  };
}

export {
  EtherWithdrawalRoute,
  ERC20WithdrawalRoute,
  ERC721WithdrawalRoute,
  WithdrawalHistoryRoute,
};
