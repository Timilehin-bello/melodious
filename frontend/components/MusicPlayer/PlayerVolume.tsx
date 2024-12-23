"use client";

import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Volume2 } from "lucide-react";
import React from "react";

const PlayerVolume = () => {
  const { volume, setVolume } = useMusicPlayer();

  return (
    <div className="flex items-center gap-2">
      <Volume2 />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        className="w-20 accent-blue-500"
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />
    </div>
  );
};

export default PlayerVolume;
