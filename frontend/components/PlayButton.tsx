"use client";

import { Track, useMusicPlayer } from "@/contexts/melodious/MusicProvider";
import { Pause, Play } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface Song {
  id: string;
  user_id: string;
  artist: string;
  title: string;
  song_path: string;
  image_path: string;
}

interface PlayButtonProps {
  data: Track;
  onClick: (song: Track, id: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const PlayButton = ({
  onClick,
  data,
  className,
  size = "md",
}: PlayButtonProps) => {
  const { currentTrack, isPlaying } = useMusicPlayer();

  const isCurrentTrack = currentTrack?.id === data.id;

  const sizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      className={twMerge(
        `
        transition-all duration-300 ease-out
        rounded-full flex items-center justify-center
        bg-[#950944] hover:bg-[#b30d52]
        shadow-lg hover:shadow-[#950944]/25
        transform hover:scale-110 active:scale-95
        group-hover:opacity-100 group-hover:translate-y-0
        ${sizeClasses[size]}
        ${isCurrentTrack ? "opacity-100" : "opacity-0 translate-y-1/4"}
        `,
        className
      )}
      onClick={() => onClick(data, data.id)}
    >
      <div className="relative">
        {isCurrentTrack && isPlaying ? (
          <Pause
            className={`
              ${iconSizes[size]} 
              text-white 
              transform transition-transform duration-200
              hover:scale-105
            `}
          />
        ) : (
          <Play
            className={`
              ${iconSizes[size]} 
              text-white 
              transform transition-transform duration-200
              hover:scale-105
            `}
          />
        )}

        {/* Optional: Add a ripple effect when playing */}
        {isCurrentTrack && isPlaying && (
          <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
        )}
      </div>
    </button>
  );
};

export default PlayButton;
