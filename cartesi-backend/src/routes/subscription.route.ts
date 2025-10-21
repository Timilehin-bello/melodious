import { AdvanceRoute, DefaultRoute } from "cartesi-router";
import { Error_out, Notice, Output } from "cartesi-wallet";
import { SubscriptionController } from "../controllers/subscription.controller";

class SubscribeRoute extends AdvanceRoute {
  subscription: SubscriptionController;

  constructor(subscription: SubscriptionController) {
    super();
    this.subscription = subscription;
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
      console.log("Executing subscription request", {
        signer,
        subscriptionLevel: request_payload.subscriptionLevel,
        amount: request_payload.amount,
      });

      const result = this.subscription.subscribe({
        walletAddress: signer,
        subscriptionLevel: request_payload.subscriptionLevel,
        amount: request_payload.amount,
        timestamp: this.msg_timestamp,
      });

      return result;
    } catch (error) {
      const error_msg = `Failed to process subscription: ${error}`;
      console.error(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class InspectRoute extends DefaultRoute {
  subscription: SubscriptionController;
  constructor(subscription: SubscriptionController) {
    super();
    this.subscription = subscription;
  }
}

class GetSubscriptionRoute extends InspectRoute {
  execute = (request: any): Output => {
    const result = this.subscription.getSubscription(request.walletAddress);
    return result;
  };
}

class GetAllSubscriptionsRoute extends InspectRoute {
  execute = (request: any): Output => {
    const result = this.subscription.getAllSubscriptions();
    return result;
  };
}

export { SubscribeRoute, GetSubscriptionRoute, GetAllSubscriptionsRoute };
