"use client";

import GenreItem from "@/components/GenreItem";
import { PopularArtistCarousel } from "@/components/PopularArtistCarousel";
import RecentItem from "@/components/RecentItem";
import TrendingSoundItem from "@/components/TrendingSoundItem";
import Image from "next/image";
import Link from "next/link";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { useConnectModal } from "thirdweb/react";
import { client } from "@/lib/client";
import { twMerge } from "tailwind-merge";
import { useCallback, useEffect, useState } from "react";
import fetchMethod from "@/lib/readState";
import { useMelodiousContext } from "@/contexts/melodious";
import { useMusic } from "@/contexts/melodious/MusicPlayerContext";
import { useMusicPlayer, Track } from "@/contexts/melodious/MusicProvider";
import SongList from "@/components/SongList";
import { SidebarAd } from "@/components/ads";
// import { usePlayer } from "@/contexts/melodious/PlayerContext";

export default function Page() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTrack, isPlaying, playTrack, playPlaylist, togglePlay } =
    useMusicPlayer();

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const trackList = await await fetchMethod("get_tracks");
        console.log("tracklist", trackList);
        setTracks(trackList);
        setIsLoading(false);
      } catch (error) {
        console.log("Failed to fetch tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, []);

  const handlePlayTrack = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else if (tracks.length === 1) {
      playTrack(track); // Play a single track if there's only one
    } else {
      playPlaylist(tracks, index); // Allow playing from any index
    }
  };

  const { connect } = useConnectModal();
  // const onPlay = useOnPlay(tracks);
  const status = useActiveWalletConnectionStatus();
  const { setConditionFulfilled } = useMelodiousContext();

  const recentlyPlayed = [
    {
      title: "Perfect",
      artistName: "Ed Sheran",
      duration: "2 mins",
    },
    {
      title: "Title Deluxe",
      artistName: "Taini Song",
      duration: "6 mins",
    },
    {
      title: "Shape of You",
      artistName: "Ed Sheran",
      duration: "4 mins",
    },
    {
      title: "Feel Something",
      artistName: "Jaymes Young",
      duration: "2 mins",
    },
    {
      title: "Bad Habits",
      artistName: "Ed Sheran",
      duration: "3 mins",
    },
    {
      title: "Feel Something",
      artistName: "Jaymes Young",
      duration: "2 mins",
    },
    {
      title: "Feel Something",
      artistName: "Jaymes Young",
      duration: "2 mins",
    },
  ];

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
                {tracks.map((track, index) => (
                  <div key={track.id} className="w-[250px] flex-shrink-0">
                    <TrendingSoundItem
                      song={track}
                      imageUrl={track.imageUrl}
                      songTitle={track.title}
                      songDetails={String(track.duration)}
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
                songList={tracks}
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
          {/* Popular Artists Section */}
          <section className="w-full mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Popular Artist
              </h3>
              <button className="text-[#910a43] hover:text-gray-300 transition-colors text-sm">
                See All
              </button>
            </div>
            <div className="w-full bg-zinc-900/30 rounded-xl p-4">
              <PopularArtistCarousel />
            </div>
          </section>

          {/* Ad Section */}
          <section className="w-full mb-8">
            <SidebarAd className="w-full" />
          </section>

          {/* Recently Played Section */}
          <section className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Recently Played
              </h3>
              <button className="text-[#950944] hover:text-gray-300 transition-colors text-sm font-medium">
                See All
              </button>
            </div>
            <div className="w-full bg-zinc-900/30 rounded-xl p-4">
              <div className="space-y-3">
                {recentlyPlayed.map((item, index) => (
                  <RecentItem
                    key={index}
                    title={item.title}
                    artistName={item.artistName}
                    duration={item.duration}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
