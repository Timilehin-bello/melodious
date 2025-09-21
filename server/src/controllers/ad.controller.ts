import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { adService } from "../services";
import ApiError from "../utils/ApiError";

/**
 * Get the next ad for a listener
 * @route GET /v1/ads/next
 * @access Private - requires authentication
 */
const getNextAd = catchAsync(async (req: any, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Get listener from user
  const listener = req.user?.listener;
  if (!listener) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is not a listener");
  }

  const ad = await adService.getNextAd(listener.id);

  if (!ad) {
    res.status(httpStatus.OK).send({
      status: "success",
      message: "No ads available",
      data: null,
    });
    return;
  }

  // Track ad impression
  await adService.trackAdPlay(ad.id, listener.id, false);

  res.status(httpStatus.OK).send({
    status: "success",
    data: {
      ad: {
        id: ad.id,
        title: ad.title,
        imageUrl: ad.imageUrl,
        audioUrl: ad.audioUrl,
        duration: ad.duration,
      },
    },
  });
});

/**
 * Mark an ad as completed
 * @route POST /v1/ads/complete
 * @access Private - requires authentication
 */
const completeAd = catchAsync(async (req: any, res: Response) => {
  const { adId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Get listener from user
  const listener = req.user?.listener;
  if (!listener) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is not a listener");
  }

  if (!adId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Ad ID is required");
  }

  // Track ad completion
  await adService.trackAdPlay(adId, listener.id, true);

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Ad completion tracked",
  });
});

/**
 * Get all ads (admin only)
 * @route GET /v1/ads
 * @access Private - admin only
 */
const getAllAds = catchAsync(async (req: Request, res: Response) => {
  const ads = await adService.getAllAds();

  res.status(httpStatus.OK).send({
    status: "success",
    data: { ads },
  });
});


/**
 * Create a new ad (admin only)
 * @route POST /v1/ads
 * @access Private - admin only
 */
const createAd = catchAsync(async (req: Request, res: Response) => {
  const adBody = req.body;

  const ad = await adService.createAd(adBody);

  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "Ad created successfully",
    data: { ad },
  });
});

/**
 * Update an ad (admin only)
 * @route PATCH /v1/ads/:adId
 * @access Private - admin only
 */
const updateAd = catchAsync(async (req: Request, res: Response) => {
  const adId = parseInt(req.params.adId);

  const ad = await adService.updateAdById(adId, req.body);

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Ad updated successfully",
    data: { ad },
  });
});

/**
 * Delete an ad (admin only)
 * @route DELETE /v1/ads/:adId
 * @access Private - admin only
 */
const deleteAd = catchAsync(async (req: Request, res: Response) => {
  const adId = parseInt(req.params.adId);

  await adService.deleteAdById(adId);

  res.status(httpStatus.OK).send({
    status: "success",
    message: "Ad deleted successfully",
  });
});

/**
 * Get ad statistics (admin only)
 * @route GET /v1/ads/:adId/stats
 * @access Private - admin only
 */
const getAdStats = catchAsync(async (req: Request, res: Response) => {
  const adId = parseInt(req.params.adId);

  const stats = await adService.getAdStats(adId);

  res.status(httpStatus.OK).send({
    status: "success",
    data: { stats },
  });
});

 /**
   * Get ads configuration
   * @route GET /v1/ads/config
   * @access Private - requires authentication
   */
  const getAdsConfig = catchAsync(async (req: Request, res: Response) => {
    const config = adService.getAdsConfig();

    res.status(httpStatus.OK).send({
      status: "success",
      data: { config },
    });
  });

export {
  getNextAd,
  completeAd,
  createAd,
  updateAd,
  deleteAd,
  getAdStats,
  getAllAds,
  getAdsConfig
};