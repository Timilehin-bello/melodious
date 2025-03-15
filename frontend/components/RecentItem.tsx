import Image from "next/image";
import React from "react";
import { Play, Pause } from "lucide-react";

interface RecentItemProps {
  title: string;
  artistName: string;
  duration: string;
  imageUrl?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
}

const RecentItem: React.FC<RecentItemProps> = ({
  title,
  artistName,
  duration,
  imageUrl = "/images/artist.svg",
  isPlaying = false,
  onPlay,
}) => {
  return (
    <div
      className="group flex items-center gap-4 p-2 rounded-lg
        hover:bg-white/5 transition-all duration-300 cursor-pointer"
      onClick={onPlay}
    >
      {/* Image Container */}
      <div className="relative flex-shrink-0">
        <Image
          src={imageUrl}
          alt={`${title} by ${artistName}`}
          width={45}
          height={45}
          className="rounded-md object-cover"
        />
        <div
          className="absolute inset-0 flex items-center justify-center
          bg-black/40 opacity-0 group-hover:opacity-100 rounded-md
          transition-opacity duration-300"
        >
          <button
            className="p-1.5 rounded-full bg-[#950944] hover:bg-[#b30d52]
              transform hover:scale-105 transition-all duration-300
              opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-white" />
            ) : (
              <Play className="w-3.5 h-3.5 text-white translate-x-[1px]" />
            )}
          </button>
        </div>
      </div>

      {/* Song Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-sm font-medium text-white truncate
            group-hover:text-[#950944] transition-colors duration-300"
          >
            {title}
          </h3>
          {isPlaying && (
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#950944]" />
          )}
        </div>
        <p
          className="text-xs text-zinc-400 truncate mt-0.5
          group-hover:text-zinc-300 transition-colors duration-300"
        >
          {artistName}
        </p>
      </div>

      {/* Duration */}
      <span
        className="text-xs text-zinc-400 flex-shrink-0
        group-hover:text-zinc-300 transition-colors duration-300"
      >
        {duration}
      </span>
    </div>
  );
};

export default RecentItem;
