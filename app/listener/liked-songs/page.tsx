import SearchInput from "@/components/SearchInput";
import { Ellipsis, EllipsisVertical, Play } from "lucide-react";
import Image from "next/image";
import React from "react";

const LikedSongs = () => {
  return (
    <div className="mt-8 px-6">
      <div className="flex align-top gap-4">
        <div className="bg-[url('/images/liked_background.svg')] h-[281px] w-[356px] text-white flex flex-col justify-center pl-10">
          <h2 className="font-bold text-5xl">Liked</h2>
          <p className="text-5xl">Songs</p>
          <p className="text-lg">100 Songs</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/liked_page_artist.svg"
                alt="Artist"
                width={210}
                height={234}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/liked_page_artist.svg"
                alt="Artist"
                width={210}
                height={234}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/liked_page_artist.svg"
                alt="Artist"
                width={210}
                height={234}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="relative flex">
              <Image
                src="/images/liked_page_artist.svg"
                alt="Artist"
                width={210}
                height={234}
                objectFit="cover"
              />

              <EllipsisVertical
                size={24}
                className="absolute top-0 left-40 text-white "
              />
              <div className="absolute left-32 top-32 bottom-0 h-10 w-10 flex items-center justify-center rounded-full bg-white ">
                <Play size={24} className="text-black" fill="black" />
              </div>
            </div>
            <h3 className="text-white font-bold mt-2">Hip Hop</h3>
            <p className="text-gray-400 text-sm mt-1">All Hip Hop Songs</p>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-[url('/images/main_background.svg')] from-[#180526] to-[#180526] bg-cover bg-center rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <SearchInput />
        </div>
        <div className="mt-12">
          <div className="bg-[#1C1C32] flex flex-wrap gap-32 px-6 py-4 w-full h-[52px] sm:w-[500px] md:w-[726px] lg:w-[726px] xl:w-[980px] 2xl:w-[1000px] text-muted">
            <p className="lg:mr-40 md:mr-0 sm:mr-0">
              <span className="pr-4">#</span> Title
            </p>
            <p>Date Added</p>
            <p></p>
          </div>

          <div className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
            <div className="flex gap-6 py-2 items-center">
              <p className="ml-2 font-semibold group-hover:hidden">{1}</p>
              <Play className="h-4 w-4 ml-2 hidden group-hover:block" />
              <div className="flex gap-2 items-center">
                <Image
                  src="/images/artist.svg"
                  alt="test"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="hover:text-[#950944]">{"Playlist 1"}</p>
              </div>
            </div>
            <p>20-12-2023</p>
            <div className="flex">
              <Ellipsis size={24} />
            </div>
          </div>
          <div className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
            <div className="flex gap-6 py-2 items-center">
              <p className="ml-2 font-semibold group-hover:hidden">{1}</p>
              <Play className="h-4 w-4 ml-2 hidden group-hover:block" />
              <div className="flex gap-2 items-center">
                <Image
                  src="/images/artist.svg"
                  alt="test"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="hover:text-[#950944]">{"Playlist 1"}</p>
              </div>
            </div>
            <p>20-12-2023</p>
            <div className="flex">
              <Ellipsis size={24} />
            </div>
          </div>
          <div className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
            <div className="flex gap-6 py-2 items-center">
              <p className="ml-2 font-semibold group-hover:hidden">{1}</p>
              <Play className="h-4 w-4 ml-2 hidden group-hover:block" />
              <div className="flex gap-2 items-center">
                <Image
                  src="/images/artist.svg"
                  alt="test"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="hover:text-[#950944]">{"Playlist 1"}</p>
              </div>
            </div>
            <p>20-12-2023</p>
            <div className="flex">
              <Ellipsis size={24} />
            </div>
          </div>
          <div className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
            <div className="flex gap-6 py-2 items-center">
              <p className="ml-2 font-semibold group-hover:hidden">{1}</p>
              <Play className="h-4 w-4 ml-2 hidden group-hover:block" />
              <div className="flex gap-2 items-center">
                <Image
                  src="/images/artist.svg"
                  alt="test"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="hover:text-[#950944]">{"Playlist 1"}</p>
              </div>
            </div>
            <p>20-12-2023</p>
            <div className="flex">
              <Ellipsis size={24} />
            </div>
          </div>
          <div className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
            <div className="flex gap-6 py-2 items-center">
              <p className="ml-2 font-semibold group-hover:hidden">{1}</p>
              <Play className="h-4 w-4 ml-2 hidden group-hover:block" />
              <div className="flex gap-2 items-center">
                <Image
                  src="/images/artist.svg"
                  alt="test"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="hover:text-[#950944]">{"Playlist 1"}</p>
              </div>
            </div>
            <p>20-12-2023</p>
            <div className="flex">
              <Ellipsis size={24} />
            </div>
          </div>
          <div className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
            <div className="flex gap-6 py-2 items-center">
              <p className="ml-2 font-semibold group-hover:hidden">{1}</p>
              <Play className="h-4 w-4 ml-2 hidden group-hover:block" />
              <div className="flex gap-2 items-center">
                <Image
                  src="/images/artist.svg"
                  alt="test"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="hover:text-[#950944]">{"Playlist 1"}</p>
              </div>
            </div>
            <p>20-12-2023</p>
            <div className="flex">
              <Ellipsis size={24} />
            </div>
          </div>
          <div className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
            <div className="flex gap-6 py-2 items-center">
              <p className="ml-2 font-semibold group-hover:hidden">{1}</p>
              <Play className="h-4 w-4 ml-2 hidden group-hover:block" />
              <div className="flex gap-2 items-center">
                <Image
                  src="/images/artist.svg"
                  alt="test"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="hover:text-[#950944]">{"Playlist 1"}</p>
              </div>
            </div>
            <p>20-12-2023</p>
            <div className="flex">
              <Ellipsis size={24} />
            </div>
          </div>
          <div className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer">
            <div className="flex gap-6 py-2 items-center">
              <p className="ml-2 font-semibold group-hover:hidden">{1}</p>
              <Play className="h-4 w-4 ml-2 hidden group-hover:block" />
              <div className="flex gap-2 items-center">
                <Image
                  src="/images/artist.svg"
                  alt="test"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="hover:text-[#950944]">{"Playlist 1"}</p>
              </div>
            </div>
            <p>20-12-2023</p>
            <div className="flex">
              <Ellipsis size={24} />
            </div>
          </div>

          <div></div>
        </div>
      </div>
    </div>
  );
};

export default LikedSongs;
