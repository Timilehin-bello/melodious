"use client";

import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import React, { useState, useEffect } from "react";

const PlayerProgress = () => {
  const { currentTrack, audioRef } = useMusicPlayer();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(currentTrack?.duration || 0);

  useEffect(() => {
    if (audioRef.current) {
      const updateProgress = () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
        }
      };

      audioRef.current.addEventListener("timeupdate", updateProgress);

      return () => {
        audioRef.current?.removeEventListener("timeupdate", updateProgress);
      };
    }
  }, [audioRef]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  return (
    <div className="mt-1 w-full">
      <input
        type="range"
        min="0"
        max={duration}
        value={progress}
        className="w-full accent-blue-500"
        onChange={handleSeek}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>
          {Math.floor(progress / 60)}:
          {String(Math.floor(progress % 60)).padStart(2, "0")}
        </span>
        <span>
          {Math.floor(duration / 60)}:
          {String(Math.floor(duration % 60)).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

export default PlayerProgress;
