"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SearchInput from "@/components/SearchInput";
import SongList from "@/components/SongList";
import BlockLoader from "@/components/BlockLoader";
import { useTracks } from "@/hooks/useTracks";
// import { useMusic } from "@/contexts/melodious/MusicPlayerContext";
import { useMusicPlayer, Track } from "@/contexts/melodious/MusicProvider";
import { useMusic } from "@/contexts/melodious/MusicPlayerContext";
import { useActiveAccount } from "thirdweb/react";
import { useUserByWallet } from "@/hooks/useUserByWallet";

const Release = () => {
  const activeAccount = useActiveAccount();
  const { tracks: allTracks, isLoading, isError, error } = useTracks();
  const { currentTrack, isPlaying, playTrack, playPlaylist, togglePlay } =
    useMusicPlayer();
  const walletAddress = activeAccount?.address;

  // Get user/artist details by wallet address
  const { user: artistUser, isLoading: userLoading } =
    useUserByWallet(walletAddress);

  // Filter tracks by artist ID and format with artist details
  const tracks = useMemo(() => {
    if (!allTracks || !artistUser?.artist) return [];

    const artistTracks = allTracks.filter(
      (track: any) => track.artistId === artistUser.artist.id
    );

    // Format tracks to include artist details
    return artistTracks.map((track: any) => ({
      ...track,
      artist: artistUser.displayName || artistUser.name, // Use string for SongList component
      artistDetails: {
        id: artistUser.artist.id,
        name: artistUser.name,
        displayName: artistUser.displayName,
        profileImage: artistUser.profileImage,
        biography: artistUser.artist.biography,
        socialMediaLinks: artistUser.artist.socialMediaLinks,
      },
    }));
  }, [allTracks, artistUser]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching tracks:", error);
      toast.error("Failed to load tracks");
    }
  }, [isError, error]);

  // Log formatted tracks with artist details
  useEffect(() => {
    if (tracks.length > 0) {
      console.log("Formatted tracks with artist details:", tracks);
    }
  }, [tracks]);

  const handlePlayTrack = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else if (tracks.length === 1) {
      playTrack(track); // Play a single track if there's only one
    } else {
      playPlaylist(tracks, index); // Allow playing from any index
    }
  };

  return (
    <div className="m-4">
      <div className="w-full flex flex-wrap items-center gap-8 bg-gradient-to-b from-[#3D2250] to-[#1E1632] rounded-md px-6 py-8 sm:px-4 sm:justify-between md:justify-between justify-between text-white">
        <div className="w-2/3">
          <div className="mb-3 py-4 px-6">
            <h2 className="text-5xl">Distribution The Easy Way</h2>
          </div>
          <p className="text-white font-semibold px-6">
            Release all your music in one place. Add new songs or manage
            released ones. Control your song data, rights holders, song splits
            and more from one convenient place.
          </p>
        </div>
        <Image
          src="/images/musicnote.svg"
          alt="Music Note"
          width={256}
          height={281}
          className=""
        />
      </div>

      <div className="mt-4 bg-[#181425] rounded-lg p-4 pb-12">
        <div className="mb-4 flex justify-between">
          <div>
            <h2 className="text-white font-bold text-md">My Music</h2>
            <p className="text-gray-400 text-sm">
              Manage your music from one place
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="bg-gray-700 px-2 mr-8 rounded-md text-sm text-white">
                Create Release
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[110px]">
              <div className="grid gap-4">
                <Link
                  href="/artist/release/single"
                  className="hover:text-[#950944]"
                >
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      Single
                    </div>
                  </div>
                </Link>
                <Link
                  href="/artist/release/album"
                  className="hover:text-[#950944]"
                >
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      Album
                    </div>
                  </div>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <SearchInput />
          <Button className="bg-[#D1E1E11C] h-[45px]">Singles</Button>
          <Button className="bg-[#D1E1E11C] h-[45px]">Sort By</Button>
          <Button>
            <Link
              href="/artist/genre"
              className="bg-[#D1E1E11C] rounded-md p-2 hover:text-[#950944] text-white"
            >
              Genre
            </Link>
          </Button>
        </div>
        {tracks.length !== 0 ? (
          <SongList
            songList={tracks}
            onPlayPause={handlePlayTrack}
            isLoading={isLoading || userLoading}
          />
        ) : (
          <div className="mt-12 px-6 py-48 bg-[#FFFFFF14] text-center text-white flex flex-col items-center justify-center rounded-xl">
            <Music2 size={54} className="mb-4" />
            <p className="font-bold">You have not released anything yet</p>
            <Popover>
              <PopoverTrigger asChild>
                <button className="bg-[#950944] px-6 py-4 mt-4 rounded-lg">
                  Create Release
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40">
                <div className="grid gap-4">
                  <Link
                    href="/artist/release/single"
                    className="hover:text-[#950944]"
                  >
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        Single
                      </div>
                    </div>
                  </Link>
                  <Link
                    href="/artist/release/album"
                    className="hover:text-[#950944]"
                  >
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        Album
                      </div>
                    </div>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
};

export default Release;
