import express from "express";
import { Router } from "express";
import auth from "../middlewares/auth";
import { authController } from "../controllers";

import validate from "../middlewares/validate";
import { authValidation } from "../validations";

const router: Router = express.Router();

router
  .route("/register")
  .post(validate(authValidation.register), authController.register);

router
  .route("/login/request")
  .get(validate(authValidation.loginRequest), authController.loginRequest);

router
  .route("/login")
  .post(validate(authValidation.login), authController.login);

router
  .route("/isLoggedIn")
  .get(validate(authValidation.isLoggedIn), authController.isLoggedIn);

router
  .route("/logout")
  .post(validate(authValidation.logout), authController.logout);

// router
//   .route("/refresh")
//   .post(validate(authValidation.refreshTokens), authController.refreshTokens);

export default router;
