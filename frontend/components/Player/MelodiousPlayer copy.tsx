"use client";

import type React from "react";
import { useState, useRef } from "react";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Shuffle,
  Maximize2,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useMusicPlayer } from "@/contexts/melodious/MusicProvider";

export const MelodiousMusicPlayerCopy = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlay,
    setVolume,
    seek,
    nextTrack,
    previousTrack,
    buffering,
    networkStrength,
  } = useMusicPlayer();

  const [expanded, setExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Format time in MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle click on progress bar
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    seek(newTime);
  };

  // Toggle mute
  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0 || isMuted) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  // Get network strength icon
  const getNetworkIcon = () => {
    switch (networkStrength) {
      case "good":
        return <Wifi size={16} className="text-green-500" />;
      case "medium":
        return <Wifi size={16} className="text-yellow-500" />;
      case "poor":
        return <Wifi size={16} className="text-red-500" />;
      case "offline":
        return <WifiOff size={16} className="text-red-500" />;
      case "unstable":
        return <Wifi size={16} className="text-yellow-500 animate-pulse" />;
    }
  };

  // Update the play/pause button to show buffering and error states
  const PlayPauseButton = () => {
    if (buffering) {
      return (
        <div className="p-3 bg-gray-500 rounded-full">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <button
        onClick={togglePlay}
        className="p-3 bg-white text-black rounded-full hover:scale-105 transition"
        disabled={buffering}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
    );
  };

  // If no track is playing, don't render the player
  if (!currentTrack) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-zinc-900 text-white transition-all duration-300 z-50 ${
        expanded ? "h-screen" : "h-20"
      }`}
    >
      {expanded ? (
        // Expanded view
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setExpanded(false)}
              className="p-2 rounded-full hover:bg-zinc-800"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <Image
                src={
                  currentTrack.imageUrl ||
                  "/placeholder.svg?height=300&width=300"
                }
                alt={currentTrack.title}
                fill
                className="object-cover rounded-md shadow-lg"
              />
              {buffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                  <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold">{currentTrack.title}</h2>
              <p className="text-zinc-400">{currentTrack.artist}</p>
              {currentTrack.album && (
                <p className="text-zinc-500 text-sm">{currentTrack.album}</p>
              )}
            </div>

            <div className="w-full max-w-xl">
              <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                <span>{formatTime(progress)}</span>
                <div className="flex items-center gap-1">
                  {getNetworkIcon()}
                  <span className="text-xs">{networkStrength}</span>
                </div>
                <span>{formatTime(duration)}</span>
              </div>

              <div
                ref={progressBarRef}
                className="h-1 bg-zinc-700 rounded-full cursor-pointer w-full"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-green-500 rounded-full relative"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8">
              <button className="text-zinc-400 hover:text-white">
                <Shuffle size={20} />
              </button>
              <button onClick={previousTrack} className="hover:text-green-500">
                <SkipBack size={24} />
              </button>
              <PlayPauseButton />
              <button onClick={nextTrack} className="hover:text-green-500">
                <SkipForward size={24} />
              </button>
              <button className="text-zinc-400 hover:text-white">
                <Repeat size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button onClick={toggleMute}>{getVolumeIcon()}</button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  const newVolume = Number.parseFloat(e.target.value);
                  setVolume(newVolume);
                  setIsMuted(newVolume === 0);
                }}
                className="w-24 accent-green-500"
              />
            </div>
          </div>
        </div>
      ) : (
        // Minimized player
        <div className="flex items-center h-full px-4">
          <div className="flex items-center gap-3 w-1/3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={
                  currentTrack.imageUrl || "/placeholder.svg?height=50&width=50"
                }
                alt={currentTrack.title}
                fill
                className="object-cover rounded"
              />
              {buffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="truncate">
              <h3 className="font-medium truncate">{currentTrack.title}</h3>
              <p className="text-xs text-zinc-400 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center gap-4 mb-1">
              <button
                onClick={previousTrack}
                className="text-zinc-400 hover:text-white"
              >
                <SkipBack size={18} />
              </button>
              <PlayPauseButton />
              <button
                onClick={nextTrack}
                className="text-zinc-400 hover:text-white"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="w-full max-w-md flex items-center gap-2 text-xs">
              <span className="text-zinc-400 w-8">{formatTime(progress)}</span>
              <div
                ref={progressBarRef}
                className="h-1 bg-zinc-700 rounded-full cursor-pointer flex-1"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                ></div>
              </div>
              <span className="text-zinc-400 w-8">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-1/3 justify-end">
            <div className="flex items-center gap-1">{getNetworkIcon()}</div>
            {networkStrength !== "good" && (
              <div className="text-yellow-500 text-sm">
                {networkStrength === "unstable"
                  ? "Unstable network"
                  : "Poor network quality"}
              </div>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white"
              >
                {getVolumeIcon()}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  const newVolume = Number.parseFloat(e.target.value);
                  setVolume(newVolume);
                  setIsMuted(newVolume === 0);
                }}
                className="w-20 accent-green-500"
              />
            </div>

            <button
              onClick={() => setExpanded(true)}
              className="text-zinc-400 hover:text-white"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
