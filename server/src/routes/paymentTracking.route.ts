import express from 'express';
import { Router } from 'express';
import { paymentTrackingController } from '../controllers';
import validate from '../middlewares/validate';
import { paymentTrackingValidation } from '../validations';

const router: Router = express.Router();

// Routes following transaction route pattern
router
  .route("/")
  .post(
    validate(paymentTrackingValidation.processPaymentRequest),
    paymentTrackingController.processPaymentRequest
  );

router
  .route("/voucher/:voucherId")
  .get(
    validate(paymentTrackingValidation.getVoucherStatus),
    paymentTrackingController.getVoucherStatus
  );

router
  .route("/history/:walletAddress")
  .get(
    validate(paymentTrackingValidation.getPaymentHistory),
    paymentTrackingController.getPaymentHistory
  );

router.get('/pending', paymentTrackingController.getPendingVouchers);
router.get('/statistics', paymentTrackingController.getPaymentStatistics);
router.get('/health', paymentTrackingController.healthCheck);

export default router;