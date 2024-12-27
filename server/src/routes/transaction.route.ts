import express from "express";
import { Router } from "express";
import { transactionsController } from "../controllers";

import validate from "../middlewares/validate";
import { transactionValidation } from "../validations";

const router: Router = express.Router();

router
  .route("/")
  .post(
    validate(transactionValidation.sendTransactionRequest),
    transactionsController.sendTransactionRequest
  );

export default router;
