"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
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
} from "lucide-react";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/contexts/melodious/MusicPlayerContext";

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    prevTrack,
    setVolume,
    seekTo,
    playerRef,
    handleProgress,
    handleDuration,
    stopAllAudio,
  } = useMusic();

  const [isMounted, setIsMounted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [preventRecursion, setPreventRecursion] = useState(false);

  // Only mount the component on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle player ended
  const handleEnded = () => {
    if (repeat) {
      seekTo(0);
      resumeTrack();
    } else {
      nextTrack();
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      // Set flag to prevent recursion
      setPreventRecursion(true);
      stopAllAudio();
      resumeTrack();
      // Reset flag after a short delay
      setTimeout(() => setPreventRecursion(false), 100);
    }
  };

  // Handle ReactPlayer onPlay event
  const handlePlayerPlay = () => {
    // Only call stopAllAudio if not triggered by our own controls
    if (!preventRecursion) {
      // Use a timeout to avoid immediate execution which could interfere with current operation
      setTimeout(() => {
        stopAllAudio();
      }, 10);
    }
  };

  // Handle volume icon based on volume level
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // If no track is playing or not mounted yet, don't render the player
  if (!currentTrack || !isMounted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-3 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-4 w-1/4">
          <div className="relative h-12 w-12 overflow-hidden rounded-md">
            <Image
              src={currentTrack.cover || "/placeholder.svg?height=48&width=48"}
              alt={currentTrack.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="truncate">
            <h4 className="text-sm font-medium truncate">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-zinc-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center space-x-4 mb-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white"
              onClick={() => setShuffle(!shuffle)}
            >
              <Shuffle
                className={`h-4 w-4 ${shuffle ? "text-green-500" : ""}`}
              />
              <span className="sr-only">Shuffle</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white"
              onClick={prevTrack}
            >
              <SkipBack className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white text-black hover:bg-zinc-200 rounded-full h-8 w-8 flex items-center justify-center"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white"
              onClick={() => setRepeat(!repeat)}
            >
              <Repeat className={`h-4 w-4 ${repeat ? "text-green-500" : ""}`} />
              <span className="sr-only">Repeat</span>
            </Button>
          </div>

          <div className="flex items-center w-full space-x-2">
            <span className="text-xs text-zinc-400 w-10 text-right">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration}
              step={1}
              onValueChange={(value) => seekTo(value[0])}
              className="w-full"
            />
            <span className="text-xs text-zinc-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 w-1/4 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white"
          >
            <VolumeIcon className="h-5 w-5" />
            <span className="sr-only">Volume</span>
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0] / 100)}
            className="w-24"
          />
        </div>
      </div>

      {/* ReactPlayer */}
      {isMounted && (
        <ReactPlayer
          ref={playerRef}
          onPlay={handlePlayerPlay}
          url={currentTrack.url}
          playing={isPlaying}
          volume={volume}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={handleEnded}
          width="0"
          height="0"
          style={{ display: "none" }}
          config={{
            file: {
              forceAudio: true,
              attributes: {
                controlsList: "nodownload",
              },
            },
          }}
        />
      )}
    </div>
  );
}
