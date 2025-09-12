import { AdvanceRoute, DefaultRoute } from "cartesi-router";
import { Error_out, Output } from "cartesi-wallet";
import { ReferralController } from "../controllers/referral.controller";

class ConvertMeloToCtsiRoute extends AdvanceRoute {
  referral: ReferralController;
  constructor(referral: ReferralController) {
    super();
    this.referral = referral;
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
      console.log(
        "Executing convert melo to CTSI request",
        request_payload.meloPoints
      );
      const conversion = this.referral.convertMeloToCtsi(
        signer,
        request_payload.meloPoints,
        request.metadata.timestamp
      );

      return conversion;
    } catch (error) {
      const error_msg = `Failed to convert melo to CTSI ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class ProcessReferralRoute extends AdvanceRoute {
  referral: ReferralController;
  constructor(referral: ReferralController) {
    super();
    this.referral = referral;
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
      console.log("Executing process referral request", request_payload);
      const referral = this.referral.processReferral(
        request_payload.referralCode,
        signer,
        request_payload.userName
      );

      return referral;
    } catch (error) {
      const error_msg = `Failed to process referral ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

// Inspect routes for reading data
class InspectRoute extends DefaultRoute {
  referral: ReferralController;
  constructor(referral: ReferralController) {
    super();
    this.referral = referral;
  }
}

class ReferralStatsRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.referral.getReferralStats(request as string);
  };
}

class UserReferralsRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.referral.getUserReferrals(request as string);
  };
}

class ReferralTransactionsRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.referral.getReferralTransactions(request as string);
  };
}

class ValidateReferralCodeRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.referral.validateReferralCode(request as string);
  };
}

class ConversionInfoRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.referral.getConversionInfo();
  };
}

export {
  ConvertMeloToCtsiRoute,
  ProcessReferralRoute,
  ReferralStatsRoute,
  UserReferralsRoute,
  ReferralTransactionsRoute,
  ValidateReferralCodeRoute,
  ConversionInfoRoute,
};
