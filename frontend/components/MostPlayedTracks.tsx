"use client";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import PlayButton from "@/components/PlayButton";
import { Track } from "@/contexts/melodious/MusicProvider";
import { useMusicPlayer } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { Play, Pause, Headphones, Trophy } from "lucide-react";

interface MostPlayedTracksProps {
  tracks: Track[];
  onPlayTrack: (track: Track, index: number) => void;
}

// Simulate play count data for tracks
const simulatePlayCounts = (tracks: Track[]) => {
  return tracks.map((track, index) => ({
    ...track,
    playCount:
      Math.floor(Math.random() * 500000) +
      100000 +
      (tracks.length - index) * 50000,
    lastPlayed: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));
};

export function MostPlayedTracks({
  tracks,
  onPlayTrack,
}: MostPlayedTracksProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [totalItems, setTotalItems] = React.useState(0);
  const { currentTrack, isPlaying } = useMusicPlayer();

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const scrollToIndex = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  // Use TanStack Query to manage simulated play count data
  const { data: topTracks = [], isLoading } = useQuery({
    queryKey: ["most-played-tracks", tracks.map((t) => t.id).join(",")],
    queryFn: async () => {
      if (tracks.length === 0) return [];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate simulated play counts
      const tracksWithPlayCount = simulatePlayCounts(tracks);

      // Sort by play count descending and take top 3
      const sortedTracks = tracksWithPlayCount
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 3)
        .map((track, index) => ({
          ...track,
          rank: index + 1,
        }));

      return sortedTracks;
    },
    enabled: tracks.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (!carouselApi) return;

    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
      setTotalItems(topTracks.length);
    };

    updateCarouselState();

    carouselApi.on("select", updateCarouselState);

    return () => {
      carouselApi.off("select", updateCarouselState);
    };
  }, [carouselApi, topTracks.length]);

  const formatPlayCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handlePlayTrack = (track: Track, index: number) => {
    onPlayTrack(track, index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#910a43] mx-auto mb-2"></div>
          <p>Loading most played tracks...</p>
        </div>
      </div>
    );
  }

  if (topTracks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No most played tracks yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Start listening to see your top tracks here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setCarouselApi}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {topTracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;

            return (
              <CarouselItem key={track.id} className="cursor-pointer group">
                <div className="p-1">
                  <Card className="overflow-hidden bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/70 transition-all duration-300">
                    <CardContent className="flex aspect-square p-0 items-center justify-center relative">
                      <div className="relative w-full h-full">
                        <Image
                          src={track.imageUrl || "/images/artist.svg"}
                          alt={track.title}
                          fill
                          className="object-cover p-1 rounded-md"
                        />

                        {/* Rank Badge */}
                        <div className="absolute top-2 left-2 bg-[#910a43] text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                          #{track.rank}
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handlePlayTrack(track, index)}
                            className="bg-[#910a43] hover:bg-[#b30d52] text-white p-3 rounded-full transform hover:scale-110 transition-all duration-200 shadow-lg"
                          >
                            {isCurrentTrack && isPlaying ? (
                              <Pause className="w-6 h-6" />
                            ) : (
                              <Play className="w-6 h-6" />
                            )}
                          </button>
                        </div>

                        {/* Track Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm truncate">
                                {track.title}
                              </h3>
                              <p className="text-xs text-gray-300 truncate">
                                {track.artist}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-300 ml-2">
                              <Headphones className="w-3 h-3" />
                              <span>{formatPlayCount(track.playCount)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Currently Playing Indicator */}
                        {isCurrentTrack && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="flex items-center gap-1 bg-[#910a43] text-white text-xs px-2 py-1 rounded-full">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isPlaying
                                    ? "bg-green-400 animate-pulse"
                                    : "bg-gray-400"
                                }`}
                              />
                              <span>{isPlaying ? "Playing" : "Paused"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex justify-center space-x-2 z-20">
            {Array.from({ length: totalItems }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  currentIndex === index
                    ? "bg-[#910a43]"
                    : "bg-gray-500 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </Carousel>
    </div>
  );
}
