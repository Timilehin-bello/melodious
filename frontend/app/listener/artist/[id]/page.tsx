"use client";
import ArtistTabs from "@/components/ArtistTabs";

import { BadgeCheck, Check, ChevronRight, Headphones } from "lucide-react";
import Image from "next/image";
import React from "react";

const Artist = () => {
  const genres = [
    {
      name: "All",
      songs: [
        {
          title: "Song 1",
          totalListen: "19,900,000",
          duration: "3:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 2",
          totalListen: "19,900,000",
          duration: "4:20",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 3",
          totalListen: "19,900,000",
          duration: "5:10",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 3",
          totalListen: "19,900,000",
          duration: "5:10",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 3",
          totalListen: "19,900,000",
          duration: "5:10",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 3",
          totalListen: "19,900,000",
          duration: "5:10",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 3",
          totalListen: "19,900,000",
          duration: "5:10",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 3",
          totalListen: "19,900,000",
          duration: "5:10",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
    {
      name: "Popular",
      songs: [
        {
          title: "Song 4",
          totalListen: "19,900,000",
          duration: "3:30",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 5",
          totalListen: "19,900,000",
          duration: "4:00",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 6",
          totalListen: "19,900,000",
          duration: "3:50",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
    {
      name: "Album",
      songs: [
        {
          title: "Song 7",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 8",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 9",
          totalListen: "19,900,000",
          duration: "7:00",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
    {
      name: "Singles",
      songs: [
        {
          title: "Song 10",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 11",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 12",
          totalListen: "19,900,000",
          duration: "7:00",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
    {
      name: "Artist Radio",
      songs: [
        {
          title: "Song 13",
          totalListen: "19,900,000",
          duration: "6:15",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 14",
          totalListen: "19,900,000",
          duration: "5:45",
          imageUrl: "/images/artist.svg",
        },
        {
          title: "Song 15",
          totalListen: "19,900,000",
          duration: "7:00",
          imageUrl: "/images/artist.svg",
        },
      ],
    },
  ];

  return (
    <div className="m-4">
      <div className="flex flex-wrap items-center gap-8 bg-artist-background bg-cover bg-center rounded-lg  px-6 py-2 sm:px-4  sm:justify-center md:justify-start justify-center text-white h-[400px]">
        <div className="pl-2 md:pl-8 sm:pl-2 xs:pl-0">
          <div className="flex items-center gap-4">
            <BadgeCheck size={16} fill="blue" />
            <h2 className="text-gray-600 text-md  font-bold">
              Verified Artist
            </h2>
          </div>

          <h2 className="text-2xl lg:text-6xl md:text-4xl sm:text-3xl md:text-left  font-bold mb-2">
            Ed Sheeran
          </h2>
          <p className="text-gray-500 text-sm mt-2">Jane Bryan</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Headphones size={16} />
            <p>
              <span className="font-bold"> 82,736,050</span>
              <span className="text-gray-500"> monthly listeners</span>
            </p>
          </div>

          <div className="flex gap-6 mt-4">
            <button className="bg-[#910a43] text-white py-2 px-10 rounded-lg">
              Play
            </button>
            <div className="flex items-center gap-2 text-white py-2 px-8 rounded-lg border-2 border-white text-xl">
              <Check size={22} />
              Following
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap p-4 text-white w-full">
        <div className=" w-full md:w-1/2 sm:w-full">
          <ArtistTabs genres={genres} />
        </div>
        <div className="w-full md:w-1/2 sm:w-full pt-2 pl-6">
          <div className="flex flex-wrap justify-between">
            <div className="flex gap-2 flex-row align-middle">
              <h3 className="font-semibold">Album</h3>
              <ChevronRight size={14} className="mt-1" />
            </div>
            <p className="">See All</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 sm:grid-cols-2 gap-2 mt-3">
            <div className="flex flex-col items-center w-[160px] h-[208px] bg-[#1A1A1A] p-2 rounded-lg">
              <Image
                src="/images/artist_album_pix.png"
                alt="Album pics"
                width={140}
                height={140}
              />
              <h3 className="text-sm font-semibold">The Shadow Theory</h3>
              <h4 className="text-sm">2018</h4>
            </div>
            <div className="flex flex-col items-center w-[160px] h-[208px] bg-[#1A1A1A] p-2 rounded-lg">
              <Image
                src="/images/artist_album_pix.png"
                alt="Album pics"
                width={140}
                height={140}
              />
              <h3 className="text-sm font-semibold">The Shadow Theory</h3>
              <h4 className="text-sm">2018</h4>
            </div>
            <div className="flex flex-col items-center w-[160px] h-[208px] bg-[#1A1A1A] p-2 rounded-lg">
              <Image
                src="/images/artist_album_pix.png"
                alt="Album pics"
                width={140}
                height={140}
              />
              <h3 className="text-sm font-semibold">The Shadow Theory</h3>
              <h4 className="text-sm">2018</h4>
            </div>
            <div className="flex flex-col items-center w-[160px] h-[208px] bg-[#1A1A1A] p-2 rounded-lg">
              <Image
                src="/images/artist_album_pix.png"
                alt="Album pics"
                width={140}
                height={140}
              />
              <h3 className="text-sm font-semibold">The Shadow Theory</h3>
              <h4 className="text-sm">2018</h4>
            </div>
            <div className="flex flex-col items-center w-[160px] h-[208px] bg-[#1A1A1A] p-2 rounded-lg">
              <Image
                src="/images/artist_album_pix.png"
                alt="Album pics"
                width={140}
                height={140}
              />
              <h3 className="text-sm font-semibold">The Shadow Theory</h3>
              <h4 className="text-sm">2018</h4>
            </div>
            <div className="flex flex-col items-center w-[160px] h-[208px] bg-[#1A1A1A] p-2 rounded-lg">
              <Image
                src="/images/artist_album_pix.png"
                alt="Album pics"
                width={140}
                height={140}
              />
              <h3 className="text-sm font-semibold">The Shadow Theory</h3>
              <h4 className="text-sm">2018</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artist;
