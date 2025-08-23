import { subscriptionService } from "./";

// Interface for ad configuration
interface AdConfig {
  enabled: boolean;
  frequency: number; // Number of songs between ads
  maxAdsPerHour: number;
  adTypes: string[];
  skipAllowed: boolean;
  skipDelay?: number; // Seconds before skip is allowed
}

// Interface for ad display rules
interface AdDisplayRules {
  FREE: AdConfig;
  BASIC: AdConfig;
  PREMIUM: AdConfig;
}

// Default ad display rules based on subscription tiers
const AD_DISPLAY_RULES: AdDisplayRules = {
  FREE: {
    enabled: true,
    frequency: 3, // Ad every 3 songs
    maxAdsPerHour: 12,
    adTypes: ["audio", "banner", "video"],
    skipAllowed: false,
  },
  BASIC: {
    enabled: true,
    frequency: 6, // Ad every 6 songs
    maxAdsPerHour: 6,
    adTypes: ["audio", "banner"],
    skipAllowed: true,
    skipDelay: 15, // 15 seconds before skip
  },
  PREMIUM: {
    enabled: false,
    frequency: 0,
    maxAdsPerHour: 0,
    adTypes: [],
    skipAllowed: false,
  },
};

// Interface for user listening session
interface ListeningSession {
  userId: number;
  songsPlayed: number;
  adsShown: number;
  sessionStartTime: Date;
  lastAdTime?: Date;
}

// In-memory storage for listening sessions (in production, use Redis or database)
const listeningSessions = new Map<number, ListeningSession>();

/**
 * Get ad configuration for a user based on their subscription level
 * @param userId - User ID
 * @returns Ad configuration object
 */
const getAdConfigForUser = async (userId: number): Promise<AdConfig> => {
  try {
    const activeSubscription = await subscriptionService.getActiveSubscription(
      userId
    );

    if (!activeSubscription || activeSubscription.status !== "ACTIVE") {
      return AD_DISPLAY_RULES.FREE;
    }

    const subscriptionLevel = activeSubscription.plan?.level || "FREE";
    return (
      AD_DISPLAY_RULES[subscriptionLevel as keyof AdDisplayRules] ||
      AD_DISPLAY_RULES.FREE
    );
  } catch (error) {
    console.error("Error getting ad config for user:", error);
    // Default to free tier ads on error
    return AD_DISPLAY_RULES.FREE;
  }
};

/**
 * Initialize or get existing listening session for a user
 * @param userId - User ID
 * @returns Listening session object
 */
const getListeningSession = (userId: number): ListeningSession => {
  if (!listeningSessions.has(userId)) {
    listeningSessions.set(userId, {
      userId,
      songsPlayed: 0,
      adsShown: 0,
      sessionStartTime: new Date(),
    });
  }
  return listeningSessions.get(userId)!;
};

/**
 * Check if an ad should be displayed based on user's subscription and listening behavior
 * @param userId - User ID
 * @returns Object indicating whether to show ad and ad type
 */
const shouldDisplayAd = async (
  userId: number
): Promise<{
  shouldShow: boolean;
  adType?: string;
  reason?: string;
}> => {
  try {
    const adConfig = await getAdConfigForUser(userId);
    const session = getListeningSession(userId);

    // Premium users don't see ads
    if (!adConfig.enabled) {
      return {
        shouldShow: false,
        reason: "Premium subscription - no ads",
      };
    }

    // Check if we've hit the hourly ad limit
    const hoursSinceSessionStart =
      (Date.now() - session.sessionStartTime.getTime()) / (1000 * 60 * 60);
    const adsPerHour =
      session.adsShown / Math.max(hoursSinceSessionStart, 1 / 60); // Minimum 1 minute

    if (adsPerHour >= adConfig.maxAdsPerHour) {
      return {
        shouldShow: false,
        reason: "Hourly ad limit reached",
      };
    }

    // Check if enough songs have been played since last ad
    const songsSinceLastAd = session.songsPlayed % adConfig.frequency;
    if (songsSinceLastAd !== 0) {
      return {
        shouldShow: false,
        reason: `Need ${
          adConfig.frequency - songsSinceLastAd
        } more songs before next ad`,
      };
    }

    // Determine ad type based on subscription level
    const availableAdTypes = adConfig.adTypes;
    if (availableAdTypes.length === 0) {
      return {
        shouldShow: false,
        reason: "No ad types available",
      };
    }

    // Select ad type (could be randomized or based on other factors)
    const adType =
      availableAdTypes[Math.floor(Math.random() * availableAdTypes.length)];

    return {
      shouldShow: true,
      adType,
      reason: "Ad frequency threshold reached",
    };
  } catch (error) {
    console.error("Error checking if ad should be displayed:", error);
    return {
      shouldShow: false,
      reason: "Error occurred",
    };
  }
};

/**
 * Record that a song has been played by the user
 * @param userId - User ID
 */
const recordSongPlayed = (userId: number): void => {
  const session = getListeningSession(userId);
  session.songsPlayed += 1;
};

/**
 * Record that an ad has been shown to the user
 * @param userId - User ID
 * @param adType - Type of ad shown
 */
const recordAdShown = (userId: number, adType: string): void => {
  const session = getListeningSession(userId);
  session.adsShown += 1;
  session.lastAdTime = new Date();

  console.log(
    `Ad shown to user ${userId}: ${adType} (Total ads in session: ${session.adsShown})`
  );
};

/**
 * Check if user can skip the current ad
 * @param userId - User ID
 * @param adStartTime - When the ad started playing
 * @returns Whether skip is allowed and remaining time
 */
const canSkipAd = async (
  userId: number,
  adStartTime: Date
): Promise<{
  canSkip: boolean;
  remainingTime?: number;
}> => {
  try {
    const adConfig = await getAdConfigForUser(userId);

    if (!adConfig.skipAllowed) {
      return { canSkip: false };
    }

    if (!adConfig.skipDelay) {
      return { canSkip: true };
    }

    const elapsedSeconds = (Date.now() - adStartTime.getTime()) / 1000;
    const remainingTime = Math.max(0, adConfig.skipDelay - elapsedSeconds);

    return {
      canSkip: remainingTime <= 0,
      remainingTime: remainingTime > 0 ? Math.ceil(remainingTime) : 0,
    };
  } catch (error) {
    console.error("Error checking if ad can be skipped:", error);
    return { canSkip: false };
  }
};

/**
 * Get ad statistics for a user
 * @param userId - User ID
 * @returns Ad statistics object
 */
const getAdStats = async (
  userId: number
): Promise<{
  subscriptionLevel: string;
  adsEnabled: boolean;
  songsPlayed: number;
  adsShown: number;
  sessionDuration: number; // in minutes
  nextAdIn?: number; // songs until next ad
}> => {
  try {
    const adConfig = await getAdConfigForUser(userId);
    const session = getListeningSession(userId);

    const sessionDurationMs = Date.now() - session.sessionStartTime.getTime();
    const sessionDurationMinutes = Math.floor(sessionDurationMs / (1000 * 60));

    let nextAdIn: number | undefined;
    if (adConfig.enabled && adConfig.frequency > 0) {
      nextAdIn =
        adConfig.frequency - (session.songsPlayed % adConfig.frequency);
      if (nextAdIn === adConfig.frequency) nextAdIn = 0; // Next song will have an ad
    }

    const activeSubscription = await subscriptionService.getActiveSubscription(
      userId
    );
    const subscriptionLevel = activeSubscription?.plan?.level || "FREE";

    return {
      subscriptionLevel,
      adsEnabled: adConfig.enabled,
      songsPlayed: session.songsPlayed,
      adsShown: session.adsShown,
      sessionDuration: sessionDurationMinutes,
      nextAdIn,
    };
  } catch (error) {
    console.error("Error getting ad stats:", error);
    throw error;
  }
};

/**
 * Clear listening session for a user (e.g., when they log out)
 * @param userId - User ID
 */
const clearListeningSession = (userId: number): void => {
  listeningSessions.delete(userId);
};

/**
 * Update ad display rules (admin function)
 * @param level - Subscription level
 * @param config - New ad configuration
 */
const updateAdDisplayRules = (
  level: keyof AdDisplayRules,
  config: Partial<AdConfig>
): void => {
  AD_DISPLAY_RULES[level] = {
    ...AD_DISPLAY_RULES[level],
    ...config,
  };
};

/**
 * Get current ad display rules
 * @returns Current ad display rules
 */
const getAdDisplayRules = (): AdDisplayRules => {
  return { ...AD_DISPLAY_RULES };
};

export {
  getAdConfigForUser,
  shouldDisplayAd,
  recordSongPlayed,
  recordAdShown,
  canSkipAd,
  getAdStats,
  clearListeningSession,
  updateAdDisplayRules,
  getAdDisplayRules,
};

export default {
  getAdConfigForUser,
  shouldDisplayAd,
  recordSongPlayed,
  recordAdShown,
  canSkipAd,
  getAdStats,
  clearListeningSession,
  updateAdDisplayRules,
  getAdDisplayRules,
};
