"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import ReactPlayer from "react-player";
import { useMusicPlayer } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { X, Volume2, VolumeX } from "lucide-react";

export const CombinedAdPlayer: React.FC = () => {
  const {
    volume,
    songsSinceAd,
    resetSongCount,
  } = useMusicPlayer();

  const { isPremiumUser } = useSubscriptionStatus();
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [adDuration, setAdDuration] = useState(0);
  const adPlayerRef = useRef<ReactPlayer>(null);
  const SONGS_BETWEEN_ADS = 3;

  // Fetch and play ad when needed
  useEffect(() => {
    const fetchAndPlayAd = async () => {
      // Only show ads to non-premium users
      if (!isPremiumUser && songsSinceAd >= SONGS_BETWEEN_ADS && !isPlayingAd) {
        setIsLoading(true);
        try {
          const data = localStorage.getItem("xx-mu");
          const token = data ? JSON.parse(data)?.tokens?.token?.access?.token : null;

          if (token) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/ads/next`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const result = await response.json();
              if (result.data?.ad) {
                setCurrentAd(result.data.ad);
                setIsPlayingAd(true);
                setAdProgress(0);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching ad:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAndPlayAd();
  }, [songsSinceAd, isPremiumUser, isPlayingAd]);

  // Handle ad completion
  const handleAdEnd = () => {
    setCurrentAd(null);
    setIsPlayingAd(false);
    setAdProgress(0);
    setAdDuration(0);
    resetSongCount(); // Reset song counter after ad
  };

  const handleAdComplete = async () => {
    if (currentAd) {
      try {
        const data = localStorage.getItem("xx-mu");
        const token = data ? JSON.parse(data)?.tokens?.token?.access?.token : null;

        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/ads/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ adId: currentAd.id }),
          });
        }
      } catch (error) {
        console.error("Error tracking ad completion:", error);
      }
    }
    handleAdEnd();
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

  if (!isPlayingAd || !currentAd) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative max-w-4xl w-full mx-4">
        {/* Ad Container */}
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Advertisement</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">
                  Ends in {formatTime(remainingTime)}
                </span>
                {/* Non-skippable indicator */}
                <div className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                  Non-skippable
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Ad Image */}
            <div className="relative aspect-video mb-6 rounded-lg overflow-hidden bg-gray-900">
              <Image
                src={currentAd.imageUrl}
                alt={currentAd.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Ad Title */}
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              {currentAd.title}
            </h2>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${(adProgress / adDuration) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX size={20} className="text-gray-400" />
                ) : (
                  <Volume2 size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden Audio Player */}
        <div className="hidden">
          <ReactPlayer
            ref={adPlayerRef}
            url={currentAd.audioUrl}
            playing={true}
            volume={isMuted ? 0 : volume}
            onEnded={handleAdComplete}
            onProgress={(state) => setAdProgress(state.playedSeconds)}
            onDuration={(duration) => setAdDuration(duration)}
            width="0"
            height="0"
          />
        </div>
      </div>
    </div>
  );
};