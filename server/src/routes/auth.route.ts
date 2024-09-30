import express from "express";
import { Router } from "express";
import auth from "../middlewares/auth";
import { authController } from "../controllers";

import validate from "../middlewares/validate";
import { authValidation } from "../validations";

const router: Router = express.Router();

router
  .route("/login/request")
  .post(validate(authValidation.loginRequest), authController.loginRequest);

router
  .route("/login")
  .post(validate(authValidation.login), authController.login);

router
  .route("/register")
  .post(validate(authValidation.register), authController.register);

export default router;
