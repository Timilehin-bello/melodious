"use client";
import BlockLoader from "@/components/BlockLoader";
import SearchInput from "@/components/SearchInput";
import SongList from "@/components/SongList";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import fetchMethod from "@/lib/readState";
import { Music2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Release = () => {
  const [tracks, setTracks] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const trackList: any[] = await fetchMethod("get_tracks");
      console.log("tracklist", trackList);
      if (Array.isArray(trackList)) {
        setTimeout(() => {
          setTracks(trackList);
          setLoading(false);
        }, 3000);
        console.log("tracks", tracks);
      } else {
        console.log("Fetched data is not an array");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTracks();
  }, []);

  const transformedData = tracks.map((track) => {
    return {
      id: track.id,
      songTitle: track.title,
      imageUrl: track.imageUrl,
      songDetails: track.duration,
      audioUrl: track.audioUrl,
    };
  });

  if (loading) {
    return <BlockLoader message="Loading songs" />;
  }

  return (
    <div className="m-4">
      <div className="w-full flex flex-wrap  items-center gap-8 bg-gradient-to-b from-[#3D2250] to-[#1E1632] rounded-md  px-6 py-8 sm:px-4  sm:justify-between md:justify-between justify-between text-white">
        <div className="w-2/3">
          <div className="mb-3 py-4 px-6">
            <h2 className="text-5xl">Distribution The Easy Way</h2>
          </div>
          <p className="text-white font-semibold px-6">
            Rlease all your music in one place Add new songs or manage released
            ones. Control your song data, rights holders, song splits and more
            from one convenient place.
          </p>
        </div>

        {/* <div className="w-1/3"> */}
        <Image
          src="/images/musicnote.svg"
          alt="artist"
          width={256}
          height={281}
          className=""
        />
        {/* </div> */}
      </div>

      <div className="mt-10 bg-[#181425] rounded-lg p-4">
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

          <Button className=" bg-[#D1E1E11C] h-[45px]">Singles</Button>
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
          <SongList songList={transformedData} />
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
            <div></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Release;
