import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { HeartIcon } from "lucide-react";
import PlayButton from "./PlayButton";
import {
  Track,
  useMusicPlayer,
} from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { useState } from "react";

interface TrendingSoundProps {
  imageUrl: string;
  songTitle: string;
  song: Track;
  songDetails: string;
  likeSong?: () => void;
  playSong: (song: Track, id: string) => void;
  isLoading?: boolean;
}

const TrendingSoundItem: React.FC<TrendingSoundProps> = ({
  imageUrl,
  songTitle,
  song,
  songDetails,
  likeSong,
  playSong,
  isLoading,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { currentTrack } = useMusicPlayer();
  const { isPlaying } = useMusicPlayer();

  const isCurrentlyPlaying = currentTrack?.id === song.id && isPlaying;
  const shouldShowPlayButton = isHovered || isCurrentlyPlaying;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <Card className="overflow-hidden bg-zinc-800/50">
          <CardContent className="aspect-square p-0">
            <div className="w-full h-full bg-zinc-700/50 rounded-lg">
              <div className="flex flex-col justify-end h-full p-4">
                <div className="h-4 bg-zinc-600 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-zinc-600 rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    likeSong?.();
  };

  return (
    <div
      className="h-full transition-transform duration-300 ease-out hover:scale-[1.02] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors duration-300">
        <CardContent className="relative aspect-square p-0">
          <div className="relative w-full h-full group">
            {/* Image */}
            <Image
              src={imageUrl}
              alt={songTitle}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`
                object-cover rounded-lg transition-transform duration-300
                ${isHovered ? "scale-105 brightness-75" : "scale-100"}
              `}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`
                absolute left-3 top-3 p-2 rounded-full
                transition-all duration-300 ease-out
                ${isHovered ? "opacity-100" : "opacity-0"}
                ${isLiked ? "bg-[#950944]/20" : "bg-black/20 hover:bg-black/40"}
              `}
            >
              <HeartIcon
                size={20}
                className={`
                  transition-colors duration-300
                  ${isLiked ? "text-[#950944] fill-[#950944]" : "text-white"}
                `}
              />
            </button>

            {/* Song Info and Play Button Container */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
              {/* Song Info */}
              <div className="flex-1 mr-4">
                <h3 className="font-semibold text-white text-lg mb-1 truncate">
                  {songTitle}
                </h3>
                <p className="text-sm text-zinc-300 truncate">{songDetails}</p>
              </div>

              {/* Play Button - Show only when hovered or actively playing */}
              <div className="flex-shrink-0">
                <PlayButton
                  onClick={playSong}
                  data={song}
                  size="md"
                  className={`
                    transition-all duration-300
                    ${
                      shouldShowPlayButton
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }
                    hover:scale-110
                  `}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingSoundItem;
