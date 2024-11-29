"use client";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Ellipsis, Play } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

const Playlist = () => {
  const { id } = useParams();
  return (
    <div className="m-4">
      <div className="flex flex-wrap items-center gap-8 bg-main-content-gradient bg-cover bg-center from-slate-400 to-lime-50 rounded-md  px-6 py-2 sm:px-4  sm:justify-center md:justify-start justify-center text-white">
        <div className="h-[236px] w-[251px] rounded-md bg-white p-2">
          <Image
            src="/images/artist.svg"
            alt="artist"
            width={256}
            height={281}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <h3>Playlist #{id}</h3>
          <h2 className="text-2xl lg:text-7xl md:text-5xl sm:text-3xl md:text-left sm:text-center text-center font-bold mb-2">
            Playlist {id}
          </h2>
          <p className="text-gray-500 text-sm mt-2">Description of Playlist</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex gap-2">
              <p>381,280 likes</p>
            </div>
            <p>
              <span className="font-bold"> 252 songs,</span> about 10hrs
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-[url('/images/main_background.svg')] from-[#180526] to-[#180526] bg-cover bg-center rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center justify-center  w-12 h-12 rounded-full bg-[#950944]">
            <Play size={24} fill="white" className=" text-white" />
          </div>
          <SearchInput />

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#950944] h-[45px]">Add Playlist</Button>
              {/* <Button variant="outline">Edit Profile</Button> */}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#212121] border-none text-white ">
              <DialogHeader>
                <DialogTitle>New Playlist</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="tile"
                    placeholder="Title"
                    className="col-span-3 w-[380px] border-b-2 border-gray-300 focus:outline-none focus:border-b-2  focus:ring-0"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="description"
                    placeholder="Description"
                    className="col-span-3 w-[380px] border-t-0 border-l-0 border-r-0 border-b-1 focus:border-t-0 focus:border-l-0 focus: border-b-1 focus:border-r-0 focus-border-white border-white rounded-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Cancel</Button>
                <Button type="submit" className="bg-[#950944]">
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

export default Playlist;
