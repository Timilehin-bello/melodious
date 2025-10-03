"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import ReactPlayer from "react-player";
import { useEnhancedMusicPlayer } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { Volume2, VolumeX } from "lucide-react";

export const CombinedAdPlayer: React.FC = () => {
  const {
    volume,
    songsSinceAd,
    resetSongCount,
    isAdPlaying,
    setIsAdPlaying,
    pauseForAd,
    resumeAfterAd,
  } = useEnhancedMusicPlayer();

  const { isPremiumUser } = useSubscriptionStatus();
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [adProgress, setAdProgress] = useState(0);
  const [adDuration, setAdDuration] = useState(0);
  const adPlayerRef = useRef<ReactPlayer>(null);
  const [songsBeforeAd, setSongsBeforeAd] = useState(3);
  const [lastAdSongCount, setLastAdSongCount] = useState(0);
  const [adsCache, setAdsCache] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRY_ATTEMPTS = 3;
  const AD_SKIP_TIMER = 5; // Skip to next ad after 5 seconds if audio fails

  // Fetch ads configuration
  useEffect(() => {
    const fetchAdsConfig = async () => {
      try {
        const data = localStorage.getItem("xx-mu");
        const token = data
          ? JSON.parse(data)?.tokens?.token?.access?.token
          : null;

        if (token) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/ads/config`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.data?.config?.frequencySongs) {
              setSongsBeforeAd(result.data.config.frequencySongs);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching ads config:", error);
      }
    };

    fetchAdsConfig();
  }, []);

  // Fetch and cache multiple ads for rotation
  const fetchAndCacheAds = async () => {
    try {
      const data = localStorage.getItem("xx-mu");
      const token = data
        ? JSON.parse(data)?.tokens?.token?.access?.token
        : null;

      if (token && adsCache.length === 0) {
        // Fetch multiple ads at once for rotation
        const promises = Array.from({ length: 5 }, () =>
          fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/ads/next`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        );

        const responses = await Promise.allSettled(promises);
        const newAds: any[] = [];

        for (const response of responses) {
          if (response.status === "fulfilled" && response.value.ok) {
            const result = await response.value.json();
            if (result.data?.ad) {
              // Check for duplicates before adding
              const exists = newAds.some((ad) => ad.id === result.data.ad.id);
              if (!exists) {
                newAds.push(result.data.ad);
              }
            }
          }
        }

        if (newAds.length > 0) {
          setAdsCache(newAds);
          console.log(`🎭 Cached ${newAds.length} ads for rotation`);
        }
      }
    } catch (error) {
      console.error("Error caching ads:", error);
    }
  };

  // Fetch ads on component mount
  useEffect(() => {
    if (!isPremiumUser) {
      fetchAndCacheAds();
    }
  }, [isPremiumUser]);

  // Prevent keyboard shortcuts during ad playback
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isAdPlaying) {
        // Prevent common media keys and shortcuts
        const preventedKeys = [
          "Space", // Play/pause
          "ArrowLeft", // Rewind
          "ArrowRight", // Fast forward
          "ArrowUp", // Volume up
          "ArrowDown", // Volume down
          "KeyM", // Mute
          "KeyJ", // Rewind 10s
          "KeyK", // Play/pause
          "KeyL", // Fast forward 10s
          "KeyF", // Fullscreen
          "Escape", // Exit fullscreen/modal
          "MediaPlayPause",
          "MediaNextTrack",
          "MediaPreviousTrack",
          "MediaStop",
        ];

        if (
          preventedKeys.includes(event.code) ||
          (event.ctrlKey && ["KeyW", "KeyT", "KeyR"].includes(event.code))
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    },
    [isAdPlaying]
  );

  // Add keyboard event listeners and prevent window manipulation
  useEffect(() => {
    if (isAdPlaying) {
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("keyup", handleKeyDown, true);

      // Prevent tab switching and other window events
      const handleVisibilityChange = () => {
        if (document.hidden && isAdPlaying) {
          // Keep ad playing even when tab is hidden
          console.log("Tab hidden during ad - continuing playback");
        }
      };

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isAdPlaying) {
          e.preventDefault();
          e.returnValue =
            "An advertisement is playing. Are you sure you want to leave?";
          return "An advertisement is playing. Are you sure you want to leave?";
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        document.removeEventListener("keydown", handleKeyDown, true);
        document.removeEventListener("keyup", handleKeyDown, true);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isAdPlaying, handleKeyDown]);

  // Get next ad from cache with rotation
  const getNextAdFromCache = () => {
    if (adsCache.length === 0) return null;

    // Use current index and rotate
    const ad = adsCache[currentAdIndex];

    // Update index for next ad (circular rotation)
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % adsCache.length);

    return ad;
  };

  // Play ad from cache or fetch new one
  const playAdWithRotation = async () => {
    setIsLoading(true);
    setAudioError(false);
    setRetryCount(0);

    try {
      // First try to get ad from cache
      let adToPlay = getNextAdFromCache();

      // If no cached ads, fetch one
      if (!adToPlay) {
        const data = localStorage.getItem("xx-mu");
        const token = data
          ? JSON.parse(data)?.tokens?.token?.access?.token
          : null;

        if (token) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/ads/next`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.data?.ad) {
              adToPlay = result.data.ad;
              // Add to cache for future use
              setAdsCache((prev) => [...prev, result.data.ad]);
            }
          }
        }
      }

      if (adToPlay) {
        console.log(`📢 Playing ad: ${adToPlay.title} (ID: ${adToPlay.id})`);
        setCurrentAd(adToPlay);
        setIsAdPlaying(true);
        setAdProgress(0);
        setLastAdSongCount(songsSinceAd);
        pauseForAd();
      } else {
        console.warn("No ads available to play");
        // If no ads available, resume music without showing ad
        resumeAfterAd();
      }
    } catch (error) {
      console.error("Error playing ad:", error);
      resumeAfterAd();
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch and play ad when needed
  useEffect(() => {
    /*
     * AD TRIGGERING LOGIC:
     * - Triggers ads every N songs (e.g., after 3rd, 6th, 9th song, etc.)
     * - Uses modulo arithmetic: songsSinceAd % songsBeforeAd === 0
     * - Prevents duplicate ads on same song count with lastAdSongCount tracking
     * - Only shows to non-premium users
     * - Rotates through cached ads for variety
     * - Example with songsBeforeAd=3: ads show at songs 3, 6, 9, 12, 15...
     */
    console.log(
      `Ad Check: Songs=${songsSinceAd}, Interval=${songsBeforeAd}, LastAd=${lastAdSongCount}, Premium=${isPremiumUser}, AdPlaying=${isAdPlaying}`
    );

    if (
      !isPremiumUser &&
      songsSinceAd > 0 &&
      songsSinceAd % songsBeforeAd === 0 &&
      songsSinceAd !== lastAdSongCount &&
      !isAdPlaying
    ) {
      console.log(
        `🎯 Triggering ad at song ${songsSinceAd} (every ${songsBeforeAd} songs)`
      );
      playAdWithRotation();
    }
  }, [
    songsSinceAd,
    isPremiumUser,
    isAdPlaying,
    songsBeforeAd,
    lastAdSongCount,
  ]);

  // Handle ad completion
  const handleAdEnd = () => {
    setCurrentAd(null);
    setIsAdPlaying(false);
    setAdProgress(0);
    setAdDuration(0);
    // Don't reset song counter - let it continue for next interval
    // Resume music player after ad ends
    resumeAfterAd();
  };

  const handleAdComplete = async () => {
    if (currentAd && !audioError) {
      try {
        const data = localStorage.getItem("xx-mu");
        const token = data
          ? JSON.parse(data)?.tokens?.token?.access?.token
          : null;

        if (token) {
          await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/ads/complete`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ adId: currentAd.id }),
            }
          );
        }
      } catch (error) {
        console.error("Error tracking ad completion:", error);
      }
    }
    handleAdEnd();
  };

  // Handle audio errors and try next ad
  const handleAudioError = (error: any) => {
    console.error("Ad audio error:", error);
    setAudioError(true);

    // Increment retry count
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    if (newRetryCount < MAX_RETRY_ATTEMPTS && adsCache.length > 1) {
      console.log(
        `🔄 Retrying with different ad (attempt ${newRetryCount}/${MAX_RETRY_ATTEMPTS})`
      );

      // Try next ad in rotation
      setTimeout(() => {
        const nextAd = getNextAdFromCache();
        if (nextAd) {
          setCurrentAd(nextAd);
          setAudioError(false);
        } else {
          console.error("No more ads to try, ending ad session");
          handleAdEnd();
        }
      }, 1000);
    } else {
      console.error(
        `Max retry attempts reached or no more ads, ending ad session`
      );
      // Show visual ad for minimum duration before resuming
      setTimeout(() => {
        handleAdEnd();
      }, AD_SKIP_TIMER * 1000);
    }
  };

  // Handle when audio can play
  const handleAudioReady = () => {
    setAudioError(false);
    console.log("✅ Ad audio loaded successfully");
  };

  // Format time display
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate remaining time
  const remainingTime = Math.max(0, adDuration - adProgress);

  if (!isAdPlaying || !currentAd) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto"
      onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
      style={{ userSelect: "none" }} // Prevent text selection
    >
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl my-auto">
        {/* Ad Container */}
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden shadow-2xl max-h-[90vh] sm:max-h-full flex flex-col">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                Advertisement
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-300">
                  Ends in {formatTime(remainingTime)}
                </span>
                {/* Non-skippable indicator */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-600 rounded text-xs text-white font-medium">
                    Non-skippable
                  </div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
            {/* Ad Image */}
            <div
              className="relative aspect-video mb-3 sm:mb-4 md:mb-6 rounded-lg overflow-hidden bg-gray-900 min-h-[120px] sm:min-h-[160px] md:min-h-[200px]"
              onContextMenu={(e) => e.preventDefault()}
              style={{ pointerEvents: "none" }}
            >
              <Image
                src={currentAd.imageUrl}
                alt={currentAd.title}
                fill
                className="object-contain"
                priority
                style={{ pointerEvents: "none" }}
                sizes="(max-width: 640px) 300px, (max-width: 768px) 400px, (max-width: 1024px) 600px, 800px"
              />
              {/* Overlay to prevent interaction */}
              <div className="absolute inset-0 bg-transparent"></div>
            </div>

            {/* Ad Title */}
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 text-center px-2 sm:px-0 break-words">
              {currentAd.title}
            </h2>

            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4">
              <div className="h-0.5 sm:h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${(adProgress / adDuration) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Information Message */}
            <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              {audioError ? (
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-yellow-400 mb-1 sm:mb-2">
                    ⚠️ Audio loading issue detected
                  </p>
                  <p className="text-xs text-gray-400">
                    {retryCount < MAX_RETRY_ATTEMPTS
                      ? `Trying alternate ad (${retryCount}/${MAX_RETRY_ATTEMPTS})...`
                      : `Ad will complete in ${AD_SKIP_TIMER} seconds`}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-gray-400 text-center leading-relaxed">
                    🎵 Your music is paused while this advertisement plays.
                    <span className="hidden sm:inline">
                      {" "}
                      Music will resume automatically when the ad completes.
                    </span>
                    <span className="sm:hidden block mt-1">
                      Music resumes after ad.
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    <span className="hidden sm:inline">
                      This supports the artists and keeps the platform free.
                    </span>
                    <span className="sm:hidden">
                      Supporting artists & free platform.
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Audio Player */}
        <div className="hidden">
          <ReactPlayer
            ref={adPlayerRef}
            url={currentAd.audioUrl}
            playing={!audioError}
            volume={isMuted ? 0 : volume}
            onEnded={handleAdComplete}
            onError={handleAudioError}
            onReady={handleAudioReady}
            onProgress={(state) => {
              if (!audioError) {
                setAdProgress(state.playedSeconds);
              }
            }}
            onDuration={(duration) => {
              if (!audioError) {
                setAdDuration(duration);
              }
            }}
            onBuffer={() => console.log("Ad audio buffering...")}
            onBufferEnd={() => console.log("Ad audio buffer complete")}
            width="0"
            height="0"
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload nofullscreen noremoteplayback",
                  disablePictureInPicture: true,
                  onContextMenu: (e: any) => e.preventDefault(),
                },
                forceAudio: true,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
