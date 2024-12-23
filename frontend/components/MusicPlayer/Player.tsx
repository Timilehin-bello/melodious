"use client";

import React from "react";
import PlayerControls from "./PlayerControls";
import PlayerProgress from "./PlayerProgress";
import PlayerVolume from "./PlayerVolume";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

const Player = () => {
  const { currentTrack } = useMusicPlayer();

  return (
    <div className="fixed left-0 bottom-0 w-full bg-gray-800 text-white p-2 shadow-lg flex items-center justify-between">
      {currentTrack && (
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="">
            <img
              src={currentTrack.coverImage}
              alt={currentTrack.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{currentTrack.title}</h2>
            <h3 className="text-xs text-gray-400">{currentTrack.artist}</h3>
          </div>
        </div>
      )}
      <div className="flex-grow">
        <PlayerProgress />
        <PlayerControls />
      </div>
      {/* <PlayerVolume /> */}
    </div>
  );
};

export default Player;
