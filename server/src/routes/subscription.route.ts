import express from "express";
import { Router } from "express";
import { subscriptionController } from "../controllers";
import validate from "../middlewares/validate";
import { subscriptionValidation } from "../validations";
import auth from "../middlewares/auth";

const router: Router = express.Router();

// Public routes
router.route("/plans").get(subscriptionController.getSubscriptionPlans).post(
  auth("manageSubscriptions"), // Admin only
  validate(subscriptionValidation.createSubscriptionPlan),
  subscriptionController.createSubscriptionPlan
);

// Protected routes (require authentication)
router
  .route("/")
  .post(
    auth(),
    validate(subscriptionValidation.createSubscription),
    subscriptionController.createSubscription
  )
  .get(
    auth(),
    validate(subscriptionValidation.getUserSubscriptions),
    subscriptionController.getUserSubscriptions
  );

router
  .route("/payment")
  .post(
    auth(),
    validate(subscriptionValidation.processPayment),
    subscriptionController.processPayment
  );

router
  .route("/process-payment")
  .post(
    auth(),
    validate(subscriptionValidation.processVoucherExecution),
    subscriptionController.processVoucherExecution
  );

router
  .route("/:subscriptionId")
  .get(
    auth(),
    validate(subscriptionValidation.getSubscription),
    subscriptionController.getSubscription
  )
  .patch(
    auth(),
    validate(subscriptionValidation.updateSubscription),
    subscriptionController.updateSubscription
  );

export default router;
