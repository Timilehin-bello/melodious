import { AdvanceRoute, DefaultRoute } from "cartesi-router";
import { Error_out, Notice, Output } from "cartesi-wallet";

import { SubscriptionController, VaultController } from "../controllers";
import { SubscriptionLevel } from "../configs/enum";

class CreateSubscriptionPlanRoute extends AdvanceRoute {
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
      console.log(
        "Executing create subscription plan request",
        request_payload
      );
      const plan = this.subscription.createSubscriptionPlan({
        name: request_payload.name,
        description: request_payload.description,
        subscriptionLevel:
          request_payload.subscriptionLevel as SubscriptionLevel,
        priceCTSI: request_payload.priceCTSI,
        durationDays: request_payload.durationDays,
        features: request_payload.features,
      });

      return plan;
    } catch (error) {
      const error_msg = `Failed to create subscription plan ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class SubscriptionPaymentRoute extends AdvanceRoute {
  subscription: SubscriptionController;
  vault: VaultController;
  constructor(subscription: SubscriptionController, vault: VaultController) {
    super();
    this.subscription = subscription;
    this.vault = vault;
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
      console.log("Executing subscription payment request", request_payload);

      // First, handle the vault deposit for the subscription payment
      const vaultDeposit = this.vault.depositToVault({
        walletAddress: signer,
        amount: request_payload.paymentAmount,
      });

      if (vaultDeposit instanceof Error_out) {
        return vaultDeposit;
      }

      // Then create the subscription
      const subscription = this.subscription.createSubscription({
        listenerId: request_payload.listenerId,
        planId: request_payload.planId,
        paymentAmount: request_payload.paymentAmount,
        transactionHash: request_payload.transactionHash,
      });

      return subscription;
    } catch (error) {
      const error_msg = `Failed to process subscription payment ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class RenewSubscriptionRoute extends AdvanceRoute {
  subscription: SubscriptionController;
  vault: VaultController;
  constructor(subscription: SubscriptionController, vault: VaultController) {
    super();
    this.subscription = subscription;
    this.vault = vault;
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
      console.log("Executing subscription renewal request", request_payload);

      // Handle the vault deposit for the renewal payment
      if (request_payload.paymentAmount > 0) {
        const vaultDeposit = this.vault.depositToVault({
          walletAddress: signer,
          amount: request_payload.paymentAmount,
        });

        if (vaultDeposit instanceof Error_out) {
          return vaultDeposit;
        }
      }

      // Renew the subscription
      const renewedSubscription = this.subscription.renewSubscription(
        request_payload.subscriptionId,
        request_payload.transactionHash
      );

      return renewedSubscription;
    } catch (error) {
      const error_msg = `Failed to renew subscription ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class CancelSubscriptionRoute extends AdvanceRoute {
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
      console.log("Executing cancel subscription request", request_payload);

      const cancelledSubscription = this.subscription.cancelSubscription(
        request_payload.subscriptionId
      );

      return cancelledSubscription;
    } catch (error) {
      const error_msg = `Failed to cancel subscription ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

// Inspect routes for querying subscription data
class GetSubscriptionPlansRoute extends DefaultRoute {
  subscription: SubscriptionController;
  constructor(subscription: SubscriptionController) {
    super();
    this.subscription = subscription;
  }
  execute = (request: any): Output => {
    return this.subscription.getActiveSubscriptionPlans();
  };
}

class GetSubscriptionRoute extends DefaultRoute {
  subscription: SubscriptionController;
  constructor(subscription: SubscriptionController) {
    super();
    this.subscription = subscription;
  }
  execute = (request: any): Output => {
    const subscriptionId = parseInt(request.subscriptionId);
    return this.subscription.getSubscription(subscriptionId);
  };
}

class GetListenerSubscriptionRoute extends DefaultRoute {
  subscription: SubscriptionController;
  constructor(subscription: SubscriptionController) {
    super();
    this.subscription = subscription;
  }
  execute = (request: any): Output => {
    const listenerId = parseInt(request.listenerId);
    return this.subscription.getListenerSubscription(listenerId);
  };
}

class GetActiveSubscriptionsRoute extends DefaultRoute {
  subscription: SubscriptionController;
  constructor(subscription: SubscriptionController) {
    super();
    this.subscription = subscription;
  }
  execute = (request: any): Output => {
    return this.subscription.getActiveSubscriptions();
  };
}

class GetExpiredSubscriptionsRoute extends DefaultRoute {
  subscription: SubscriptionController;
  constructor(subscription: SubscriptionController) {
    super();
    this.subscription = subscription;
  }
  execute = (request: any): Output => {
    return this.subscription.getExpiredSubscriptions();
  };
}

class InitializeDefaultPlansRoute extends AdvanceRoute {
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

    try {
      console.log("Executing initialize default plans request");
      const result = this.subscription.initializeDefaultPlans();
      return result;
    } catch (error) {
      const error_msg = `Failed to initialize default plans ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

export {
  CreateSubscriptionPlanRoute,
  SubscriptionPaymentRoute,
  RenewSubscriptionRoute,
  CancelSubscriptionRoute,
  GetSubscriptionPlansRoute,
  GetSubscriptionRoute,
  GetListenerSubscriptionRoute,
  GetActiveSubscriptionsRoute,
  GetExpiredSubscriptionsRoute,
  InitializeDefaultPlansRoute,
};
