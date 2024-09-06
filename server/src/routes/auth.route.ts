import express from "express";
import { Router } from "express";
import auth from "../middlewares/auth";
import { authController } from "../controllers";

import validate from "../middlewares/validate";

const router: Router = express.Router();

router.route("/send-request").post();

export default router;
