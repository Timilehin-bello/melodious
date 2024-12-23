"use client";
import React from "react";
import {
  Pause,
  Play,
  Redo,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

const PlayerControls = () => {
  const {
    isPlaying,
    togglePlayPause,
    nextTrack,
    prevTrack,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
  } = useMusicPlayer();

  return (
    <div className="flex items-center justify-center gap-4 ">
      <button
        className={`text-xl ${shuffle ? "text-blue-500" : "text-gray-400"}`}
        onClick={toggleShuffle}
      >
        <Shuffle />
      </button>
      <button className="text-2xl" onClick={prevTrack}>
        <SkipBack />
      </button>
      <button
        className="text-3xl bg-blue-500 p-2 rounded-full hover:bg-blue-600"
        onClick={togglePlayPause}
      >
        {isPlaying ? <Pause /> : <Play />}
      </button>
      <button className="text-2xl" onClick={nextTrack}>
        <SkipForward />
      </button>
      <button
        className={`text-xl ${repeat ? "text-blue-500" : "text-gray-400"}`}
        onClick={toggleRepeat}
      >
        <Redo />
      </button>
    </div>
  );
};

export default PlayerControls;
