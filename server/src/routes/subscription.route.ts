import express from "express";
import { Router } from "express";
import auth from "../middlewares/auth";
import { subscriptionController } from "../controllers";
import validate from "../middlewares/validate";
import { subscriptionValidation } from "../validations";

const router: Router = express.Router();

// Initialize default subscription plans (admin only)
router
  .route("/plans/initialize")
  .post(auth("admin"), subscriptionController.initializeDefaultPlans);

// Subscription plans routes
router
  .route("/plans")
  .post(
    auth("admin"),
    validate(subscriptionValidation.createSubscriptionPlan),
    subscriptionController.createSubscriptionPlan
  )
  .get(subscriptionController.getSubscriptionPlans);

router
  .route("/plans/:planId")
  .get(
    validate(subscriptionValidation.getSubscriptionPlan),
    subscriptionController.getSubscriptionPlan
  );

// User subscription routes
router
  .route("/")
  .post(
    auth(),
    validate(subscriptionValidation.createSubscription),
    subscriptionController.createSubscription
  );

router
  .route("/:subscriptionId")
  .get(
    auth(),
    validate(subscriptionValidation.getSubscription),
    subscriptionController.getSubscription
  );

router
  .route("/listener/:listenerId/active")
  .get(
    auth(),
    validate(subscriptionValidation.getActiveSubscription),
    subscriptionController.getActiveSubscription
  );

router
  .route("/listener/:listenerId")
  .get(
    auth(),
    validate(subscriptionValidation.getListenerSubscriptions),
    subscriptionController.getListenerSubscriptions
  );

router
  .route("/:subscriptionId/cancel")
  .patch(
    auth(),
    validate(subscriptionValidation.cancelSubscription),
    subscriptionController.cancelSubscription
  );

router
  .route("/:subscriptionId/renew")
  .patch(
    auth(),
    validate(subscriptionValidation.renewSubscription),
    subscriptionController.renewSubscription
  );

// Payment routes
router
  .route("/payments")
  .post(
    auth(),
    validate(subscriptionValidation.processSubscriptionPayment),
    subscriptionController.processSubscriptionPayment
  );

router
  .route("/payments/:paymentId")
  .get(
    auth(),
    validate(subscriptionValidation.getPayment),
    subscriptionController.getPayment
  );

router
  .route("/payments/:paymentId/confirm")
  .patch(
    auth(),
    validate(subscriptionValidation.confirmSubscriptionPayment),
    subscriptionController.confirmSubscriptionPayment
  );

router
  .route("/payments/listener/:listenerId")
  .get(
    auth(),
    validate(subscriptionValidation.getListenerPayments),
    subscriptionController.getListenerPayments
  );

router
  .route("/payments/vault/:vaultDepositId/monitor")
  .get(
    auth(),
    validate(subscriptionValidation.monitorVaultDeposit),
    subscriptionController.monitorVaultDeposit
  );

// Voucher-based subscription routes
router
  .route("/voucher")
  .post(
    auth(),
    validate(subscriptionValidation.createVoucherSubscription),
    subscriptionController.createVoucherSubscription
  );

router
  .route("/voucher/activate")
  .patch(
    auth(),
    validate(subscriptionValidation.activateVoucherSubscription),
    subscriptionController.activateVoucherSubscription
  );

router
  .route("/voucher/:voucherId")
  .get(
    auth(),
    validate(subscriptionValidation.getSubscriptionByVoucher),
    subscriptionController.getSubscriptionByVoucher
  )
  .delete(
    auth(),
    validate(subscriptionValidation.cancelVoucherSubscription),
    subscriptionController.cancelVoucherSubscription
  );

router
  .route("/voucher/payment/process")
  .post(
    auth(),
    validate(subscriptionValidation.processVoucherPaymentRequest),
    subscriptionController.processVoucherPaymentRequest
  );

// Admin routes
router
  .route("/expired")
  .get(auth("admin"), subscriptionController.getExpiredSubscriptions)
  .patch(auth("admin"), subscriptionController.processExpiredSubscriptions);

export default router;
