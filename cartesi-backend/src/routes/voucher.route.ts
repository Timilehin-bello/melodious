import { AdvanceRoute, DefaultRoute } from "cartesi-router";
import { Error_out, Log } from "cartesi-wallet";
import { VoucherController } from "../controllers";

class RegisterVoucherRoute extends AdvanceRoute {
  voucherController: VoucherController;
  
  constructor(voucherController: VoucherController) {
    super();
    this.voucherController = voucherController;
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
      const voucherData = {
        walletAddress: signer,
        amount: request_payload.amount,
        voucherType: request_payload.voucherType,
        transactionHash: request_payload.transactionHash
      };
      
      const result = this.voucherController.registerVoucher(voucherData);
      return result;
    } catch (error) {
      const error_msg = `Failed to register voucher: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class UpdateVoucherStatusRoute extends AdvanceRoute {
  voucherController: VoucherController;
  
  constructor(voucherController: VoucherController) {
    super();
    this.voucherController = voucherController;
  }
  
  _parse_request(request: any) {
    this.parse_request(request);
  }
  
  public execute = (request: any) => {
    this._parse_request(request);
    
    try {
      const updateData = {
        voucherId: this.request_args.voucherId,
        status: this.request_args.status,
        transactionHash: this.request_args.transactionHash,
        failureReason: this.request_args.failureReason
      };
      
      const result = this.voucherController.updateVoucherStatus(updateData);
      return result;
    } catch (error) {
      const error_msg = `Failed to update voucher status: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class GetVoucherStatusRoute extends DefaultRoute {
  voucherController: VoucherController;
  
  constructor(voucherController: VoucherController) {
    super();
    this.voucherController = voucherController;
  }
  
  public execute = (request: any) => {
    try {
      const queryData = {
        voucherId: request.voucherId
      };
      
      const result = this.voucherController.getVoucherStatus(queryData);
      return result;
    } catch (error) {
      const error_msg = `Failed to get voucher status: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class GetPendingVouchersRoute extends DefaultRoute {
  voucherController: VoucherController;
  
  constructor(voucherController: VoucherController) {
    super();
    this.voucherController = voucherController;
  }
  
  public execute = () => {
    try {
      const result = this.voucherController.getPendingVouchers();
      return result;
    } catch (error) {
      const error_msg = `Failed to get pending vouchers: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class GetWalletVoucherHistoryRoute extends DefaultRoute {
  voucherController: VoucherController;
  
  constructor(voucherController: VoucherController) {
    super();
    this.voucherController = voucherController;
  }
  
  public execute = (request: any) => {
    try {
      const queryData = {
        walletAddress: request.walletAddress
      };
      
      const result = this.voucherController.getWalletVoucherHistory(queryData);
      return result;
    } catch (error) {
      const error_msg = `Failed to get wallet voucher history: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class GetVoucherStatisticsRoute extends DefaultRoute {
  voucherController: VoucherController;
  
  constructor(voucherController: VoucherController) {
    super();
    this.voucherController = voucherController;
  }
  
  public execute = () => {
    try {
      const result = this.voucherController.getVoucherStatistics();
      return result;
    } catch (error) {
      const error_msg = `Failed to get voucher statistics: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class CleanupOldVouchersRoute extends AdvanceRoute {
  voucherController: VoucherController;
  
  constructor(voucherController: VoucherController) {
    super();
    this.voucherController = voucherController;
  }
  
  public execute = () => {
    try {
      const result = this.voucherController.cleanupOldVouchers();
      return result;
    } catch (error) {
      const error_msg = `Failed to cleanup old vouchers: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

export {
  RegisterVoucherRoute,
  UpdateVoucherStatusRoute,
  GetVoucherStatusRoute,
  GetPendingVouchersRoute,
  GetWalletVoucherHistoryRoute,
  GetVoucherStatisticsRoute,
  CleanupOldVouchersRoute
};