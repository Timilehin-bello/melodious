import express from "express";
import { Router } from "express";
import { adController } from "../controllers";
import auth from "../middlewares/auth";
import validate from "../middlewares/validate";
import adValidation from "../validations/ad.validation";
const router: Router = express.Router();

// Public routes (require authentication)

router
    .route("/config")
    .get(auth(), adController.getAdsConfig);
    
router
  .route("/next")
  .get(auth(), adController.getNextAd);

router
  .route("/complete")
  .post(auth(), validate(adValidation.completeAd), adController.completeAd);

// Admin routes (require admin role)
router
  .route("/")
  .get(auth("manageAds"), adController.getAllAds)
  .post(auth("manageAds"), validate(adValidation.createAd), adController.createAd);

router
  .route("/:adId")
  .patch(auth("manageAds"), validate(adValidation.updateAd), adController.updateAd)
  .delete(auth("manageAds"), adController.deleteAd);

router
  .route("/:adId/stats")
  .get(auth("manageAds"), adController.getAdStats);

export default router;