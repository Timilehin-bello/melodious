import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import { subscriptionService } from "../services";

// Extend Request interface to include user and subscription info
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    walletAddress: string;
    role: string;
    [key: string]: any;
  };
  subscription?: {
    id: string;
    planId: number;
    level: string;
    status: string;
    endDate: Date;
    plan?: {
      name: string;
      level: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

// Middleware to check if user has any active subscription
const requireActiveSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"));
    }

    const activeSubscription = await subscriptionService.getActiveSubscription(
      req.user.id
    );

    if (!activeSubscription) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "Active subscription required to access this feature"
        )
      );
    }

    // Check if subscription is actually active and not expired
    if (
      activeSubscription.status !== "ACTIVE" ||
      new Date() > activeSubscription.endDate
    ) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "Your subscription has expired. Please renew to continue."
        )
      );
    }

    // Attach subscription info to request for use in controllers
    req.subscription = {
      ...activeSubscription,
      level: activeSubscription.plan?.level || "FREE",
    };
    next();
  } catch (error) {
    next(
      new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Subscription check failed"
      )
    );
  }
};

// Middleware to check subscription level (PREMIUM, BASIC, etc.)
const requireSubscriptionLevel = (...requiredLevels: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return next(
          new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
        );
      }

      const activeSubscription =
        await subscriptionService.getActiveSubscription(req.user.id);

      if (!activeSubscription) {
        return next(
          new ApiError(
            httpStatus.FORBIDDEN,
            "Active subscription required to access this feature"
          )
        );
      }

      // Get subscription plan details from included plan
      const plan = activeSubscription.plan;

      if (!plan) {
        return next(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Subscription plan not found"
          )
        );
      }

      // Check if user's subscription level meets requirements
      if (!requiredLevels.includes(plan.level)) {
        return next(
          new ApiError(
            httpStatus.FORBIDDEN,
            `This feature requires ${requiredLevels.join(
              " or "
            )} subscription level. Your current level: ${plan.level}`
          )
        );
      }

      // Attach subscription and plan info to request
      req.subscription = {
        ...activeSubscription,
        level: plan?.level || "FREE",
        planName: plan?.name || "Unknown",
      };

      next();
    } catch (error) {
      next(
        new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Subscription level check failed"
        )
      );
    }
  };
};

// Middleware for premium features (requires PREMIUM subscription)
const requirePremium = requireSubscriptionLevel("PREMIUM");

// Middleware for basic or higher features (requires BASIC or PREMIUM)
const requireBasicOrHigher = requireSubscriptionLevel("BASIC", "PREMIUM");

// Middleware to check subscription limits (e.g., upload limits, playlist limits)
const checkSubscriptionLimits = (limitType: string, maxCount?: number) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return next(
          new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
        );
      }

      const activeSubscription =
        await subscriptionService.getActiveSubscription(req.user.id);

      if (!activeSubscription) {
        // For free users, apply strict limits
        const freeLimits = {
          uploads: 5,
          playlists: 3,
          downloads: 0,
          skipAds: false,
        };

        if (
          limitType === "uploads" &&
          maxCount &&
          maxCount > freeLimits.uploads
        ) {
          return next(
            new ApiError(
              httpStatus.FORBIDDEN,
              `Free users can only upload ${freeLimits.uploads} tracks. Upgrade to premium for unlimited uploads.`
            )
          );
        }

        if (
          limitType === "playlists" &&
          maxCount &&
          maxCount > freeLimits.playlists
        ) {
          return next(
            new ApiError(
              httpStatus.FORBIDDEN,
              `Free users can only create ${freeLimits.playlists} playlists. Upgrade to premium for unlimited playlists.`
            )
          );
        }

        if (limitType === "downloads") {
          return next(
            new ApiError(
              httpStatus.FORBIDDEN,
              "Downloads are only available for premium subscribers."
            )
          );
        }

        if (limitType === "skipAds") {
          return next(
            new ApiError(
              httpStatus.FORBIDDEN,
              "Ad-free listening is only available for premium subscribers."
            )
          );
        }
      } else {
        // Get subscription plan details for premium users
        const plan = activeSubscription.plan;

        if (plan && plan.level === "BASIC") {
          // Basic subscribers have higher limits but not unlimited
          const basicLimits = {
            uploads: 50,
            playlists: 20,
            downloads: 10,
            skipAds: false,
          };

          if (
            limitType === "uploads" &&
            maxCount &&
            maxCount > basicLimits.uploads
          ) {
            return next(
              new ApiError(
                httpStatus.FORBIDDEN,
                `Basic subscribers can upload up to ${basicLimits.uploads} tracks. Upgrade to premium for unlimited uploads.`
              )
            );
          }

          if (
            limitType === "downloads" &&
            maxCount &&
            maxCount > basicLimits.downloads
          ) {
            return next(
              new ApiError(
                httpStatus.FORBIDDEN,
                `Basic subscribers can download up to ${basicLimits.downloads} tracks per month. Upgrade to premium for unlimited downloads.`
              )
            );
          }

          if (limitType === "skipAds") {
            return next(
              new ApiError(
                httpStatus.FORBIDDEN,
                "Ad-free listening is only available for premium subscribers."
              )
            );
          }
        }
        // Premium users have no limits, so we don't need to check anything
      }

      next();
    } catch (error) {
      next(
        new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Subscription limit check failed"
        )
      );
    }
  };
};

// Middleware to add subscription info to request without enforcing requirements
const attachSubscriptionInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user) {
      const activeSubscription =
        await subscriptionService.getActiveSubscription(req.user.id);

      if (activeSubscription) {
        const plan = await subscriptionService.getSubscriptionPlanById(
          activeSubscription.planId
        );

        req.subscription = {
          ...activeSubscription,
          level: activeSubscription.plan?.level || "FREE",
          planName: activeSubscription.plan?.name || "Free",
        };
      } else {
        req.subscription = {
          id: "",
          planId: 0,
          level: "FREE",
          status: "INACTIVE",
          endDate: new Date(),
          planName: "Free",
        };
      }
    }
    next();
  } catch (error) {
    // Don't fail the request if subscription info can't be attached
    next();
  }
};

export {
  requireActiveSubscription,
  requireSubscriptionLevel,
  requirePremium,
  requireBasicOrHigher,
  checkSubscriptionLimits,
  attachSubscriptionInfo,
};

export default {
  requireActiveSubscription,
  requireSubscriptionLevel,
  requirePremium,
  requireBasicOrHigher,
  checkSubscriptionLimits,
  attachSubscriptionInfo,
};
