"use client";

import GenreItem from "@/components/GenreItem";
import { MostPlayedTracks } from "@/components/MostPlayedTracks";
import RecentItem from "@/components/RecentItem";
import TrendingSoundItem from "@/components/TrendingSoundItem";
import Image from "next/image";
import Link from "next/link";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { useConnectModal } from "thirdweb/react";
import { client } from "@/lib/client";
import { twMerge } from "tailwind-merge";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useTracks } from "@/hooks/useTracks";
import { useRepositoryData } from "@/hooks/useNoticesQuery";
import toast from "react-hot-toast";
import { useMelodiousContext } from "@/contexts/melodious";
import { useMusic } from "@/contexts/melodious/MusicPlayerContext";
import {
  useMusicPlayer,
  Track,
} from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import SongList from "@/components/SongList";
import { SidebarAd } from "@/components/ads";
import { Clock } from "lucide-react";
// import { usePlayer } from "@/contexts/melodious/PlayerContext";

export default function Page() {
  const { tracks, isLoading, isError, error } = useTracks();
  const { users } = useRepositoryData();
  const {
    currentTrack,
    isPlaying,
    playTrack,
    playPlaylist,
    togglePlay,
    recentlyPlayed,
    isLoadingRecentlyPlayed,
    clearRecentlyPlayed,
  } = useMusicPlayer();

  useEffect(() => {
    if (isError) {
      console.error("Error fetching tracks:", error);
      toast.error("Failed to load tracks");
    }
  }, [isError, error]);

  console.log("tracklist", tracks);

  // Enhanced tracks with artist details
  const tracksWithArtistDetails = useMemo(() => {
    if (!tracks || !users) return tracks;

    return tracks.map((track: Track) => {
      // Find the artist user by matching user.artist.id with track.artistId
      const artistUser = users.find(
        (user: any) =>
          user.artist &&
          track.artistId &&
          user.artist.id === parseInt(track.artistId)
      );
      console.log("artistUser", artistUser, "track", JSON.stringify(track));
      return {
        ...track,
        artist: artistUser?.displayName || artistUser?.name || "Unknown Artist",
        artistDetails: artistUser || null,
      };
    });
  }, [tracks, users]);

  // Enhanced recently played tracks with artist details
  const recentlyPlayedWithArtistDetails = useMemo(() => {
    if (!recentlyPlayed || !users) return recentlyPlayed || [];

    return recentlyPlayed
      .filter((track: Track) => {
        // Filter out tracks that are missing essential data or have been removed
        return track && track.id && track.title && track.duration;
      })
      .map((track: Track) => {
        // Find the artist user by matching user.artist.id with track.artistId
        const artistUser = users.find(
          (user: any) =>
            user.artist &&
            track.artistId &&
            user.artist.id === parseInt(track.artistId)
        );

        return {
          ...track,
          artist:
            artistUser?.displayName || artistUser?.name || "Unknown Artist",
          artistDetails: artistUser || null,
          // Provide fallback values for potentially missing data
          imageUrl: track.imageUrl || "/images/artist.svg",
          duration: track.duration || 0,
        };
      });
  }, [recentlyPlayed, users]);

  const handlePlayTrack = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else if (tracks.length === 1) {
      playTrack(track); // Play a single track if there's only one
    } else {
      playPlaylist(tracks, index); // Allow playing from any index
    }
  };

  const handlePlayRecentTrack = (track: Track, index: number) => {
    try {
      // Validate track data before attempting to play
      if (!track || !track.id || !track.title) {
        toast.error("This track is no longer available");
        return;
      }

      // Check if the track still exists in the main tracks list
      const trackExists = tracks?.some((t: Track) => t.id === track.id);
      if (!trackExists) {
        toast.error("This track has been removed and is no longer available");
        // Note: The track will be automatically filtered out on next render
        // due to the validation in recentlyPlayedWithArtistDetails
        return;
      }

      if (currentTrack?.id === track.id) {
        togglePlay();
      } else {
        playTrack(track);
      }
    } catch (error) {
      console.error("Error playing recently played track:", error);
      toast.error("Unable to play this track");
    }
  };

  const { connect } = useConnectModal();
  // const onPlay = useOnPlay(tracks);
  const status = useActiveWalletConnectionStatus();
  const { setConditionFulfilled } = useMelodiousContext();

  // Recently played tracks are now managed by the enhanced music provider
  // and automatically populated when tracks are played

  const likeSong = async () => {
    if (status === "disconnected") {
      await connect({ client, size: "compact" }); // opens the connect modal
    }

    // alert("Like Song ");
  };

  const [isConnected, setIsConnected] = useState(false);

  return (
    <div
      className={twMerge(
        `relative grid  w-full h-screen
      grid-cols-1 md:grid-cols-4 lg:grid-cols-4 
       `,
        currentTrack && "pb-[90px]"
      )}
    >
      {/* Main Content Column - Scrollable */}
      <div className="md:col-span-3 h-screen overflow-hidden px-4">
        <div className="h-full overflow-y-auto  pt-4 pb-8">
          {/* Header Section */}
          <header className="space-y-1 mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Good Morning Guest!
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Discover your favorite music
            </p>
          </header>

          {/* Banner Section */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#950944] to-[#1C1C32] mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 sm:p-8">
              <div className="z-10 space-y-4 text-center sm:text-left mb-6 sm:mb-0">
                <Image
                  src="/images/melodious_text.svg"
                  height={37}
                  width={149}
                  alt="melodious text"
                  className="mx-auto sm:mx-0"
                />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  New Released Sounds
                </h2>
              </div>
              <div className="relative w-full sm:w-auto h-[200px] sm:h-auto">
                <Image
                  src="/images/woman-with-headphone-front.png"
                  width={410}
                  height={357}
                  alt="woman with headphone"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Trending Songs Section */}
          <section className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Trending Songs
              </h2>
            </div>
            <div className="overflow-x-auto  pb-4">
              <div className="flex gap-4 min-w-min">
                {tracksWithArtistDetails?.map((track: any, index: number) => (
                  <div key={track.id} className="w-[250px] flex-shrink-0">
                    <TrendingSoundItem
                      song={track}
                      imageUrl={track.imageUrl}
                      songTitle={track.title}
                      songDetails={track.artist || "Unknown Artist"}
                      playSong={() => handlePlayTrack(track, index)}
                      likeSong={likeSong}
                      isLoading={isLoading}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Song List Section */}
          <section className="space-y-4">
            <div className="mb-14">
              <SongList
                songList={tracksWithArtistDetails}
                onPlayPause={handlePlayTrack}
                isLoading={isLoading}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Sidebar - Scrollable */}
      <aside className="md:col-span-1 h-screen w-full">
        <div className="h-full w-full overflow-y-auto  pt-[9px] pb-8 pr-4">
          {/* Most Played Tracks Section */}
          <section className="w-full mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Most Played Tracks
              </h3>
              <button className="text-[#910a43] hover:text-gray-300 transition-colors text-sm">
                See All
              </button>
            </div>
            <div className="w-full bg-zinc-900/30 rounded-xl p-4">
              <MostPlayedTracks
                tracks={tracksWithArtistDetails}
                onPlayTrack={handlePlayTrack}
              />
            </div>
          </section>

          {/* Ad Section */}
          <section className="w-full mb-8">
            <SidebarAd className="w-full" />
          </section>

          {/* Recently Played Section */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Recently Played
              </h3>
              <div className="flex gap-2">
                {recentlyPlayedWithArtistDetails.length > 0 && (
                  <button
                    onClick={clearRecentlyPlayed}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                  >
                    Clear
                  </button>
                )}
                {/* <button className="text-[#950944] hover:text-gray-300 transition-colors text-sm font-medium">
                  See All
                </button> */}
              </div>
            </div>
            <div className="w-full bg-zinc-900/30 rounded-xl p-4">
              <div className="space-y-3">
                {isLoadingRecentlyPlayed ? (
                  <div className="text-gray-400 text-sm">
                    Loading recently played...
                  </div>
                ) : recentlyPlayedWithArtistDetails.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <div className="text-center">
                      <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">
                        No recently played tracks
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Your listening history will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  recentlyPlayedWithArtistDetails.map((track, index) => (
                    <RecentItem
                      key={track.id || index}
                      title={track.title}
                      artistName={track.artist}
                      duration={`${
                        `${track.duration}`.includes(":")
                          ? track.duration
                          : `${track.duration}:00`
                      }`}
                      // duration={`${Math.floor(track.duration / 60)}:${String(
                      //   track.duration % 60
                      // ).padStart(2, "0")}`}
                      imageUrl={track.imageUrl}
                      isPlaying={currentTrack?.id === track.id && isPlaying}
                      onPlay={() => handlePlayRecentTrack(track, index)}
                    />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
