"use client";
import MusicUpload from "@/components/MusicUpload";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { useMelodiousContext } from "@/contexts/melodious";
import { Ellipsis, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface SongMetadata {
  file: File;
  title: string;
  description: string;
  genre: string;
  image?: File;
  duration?: string;
}

const MyMusic = () => {
  const [uploadType, setUploadType] = useState<"single" | "album" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [songs, setSongs] = useState<SongMetadata[]>([]);
  const [albumName, setAlbumName] = useState("");
  const [singleSong, setSingleSong] = useState<File | null>(null);

  const { uploadToIPFS } = useMelodiousContext();

  const handleUpload = async () => {
    setLoading(true);
    setStatus("");
    try {
      if (uploadType === "album") {
        if (!albumName) {
          alert("Please provide an album name.");
          return;
        }
        if (!songs.length) {
          alert("Please upload at least one song.");
          return;
        }
        const ipfsResults = await Promise.all(
          songs.map(
            async ({ file, title, description, genre, image, duration }) => {
              const ipfsHash = await uploadToIPFS(file);
              const imageHash = image ? await uploadToIPFS(image) : null;
              return {
                title,
                description,
                genre,
                ipfsHash,
                imageHash,
                duration,
              };
            }
          )
        );
        setStatus(
          `Album '${albumName}' uploaded with songs: ${JSON.stringify(
            ipfsResults,
            null,
            2
          )}`
        );
      } else if (uploadType === "single") {
        if (!singleSong) {
          alert("Please upload a song.");
          return;
        }
        const ipfsHash = await uploadToIPFS(singleSong);
        setStatus(`Single song uploaded with hash: ${ipfsHash}`);
      }
    } catch (error) {
      setStatus("Error during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-4">
      <div className="w-full flex flex-wrap  items-center gap-8 bg-[url('/images/icons/banner.svg')] bg-cover bg-center rounded-md  px-6 py-8 sm:px-4  sm:justify-between md:justify-between justify-between text-white">
        <div className="w-2/3">
          <div className="w-64 mb-3 rounded-md bg-gradient-to-br from-[#6B1F97B8] via-[#2A1A4B] to-[#1B184259] py-4 px-6">
            <h2 className="text-5xl">My Music</h2>
          </div>
          <p className="text-white font-semibold">
            Manage all your music in one place Add new songs or manage released
            ones. Control your song data, rights holders, song splits and more
            from one convenient place.
          </p>
        </div>

        {/* <div className="w-1/3"> */}
        <Image
          src="/images/melodious_logo.svg"
          alt="artist"
          width={256}
          height={281}
          className=""
        />
        {/* </div> */}
      </div>
      <div className="mt-10 bg-[url('/images/main_background.svg')] from-[#180526] to-[#180526] bg-cover bg-center rounded-lg p-4">
        <div className="mb-4">
          <h2 className="text-white font-bold text-md">My Music</h2>
          <p className="text-gray-400 text-sm">
            Manage your music from one place
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <SearchInput />

          <Button
            onClick={() => {
              setUploadType("single");
              setModalOpen(true);
            }}
            className={`h-[45px] px-4 py-2 rounded-md text-white ${
              uploadType === "single" ? "bg-blue-600" : "bg-blue-400"
            } hover:bg-blue-500`}
          >
            Singles
          </Button>
          <Button
            onClick={() => {
              setUploadType("album");
              setModalOpen(true);
            }}
            className={`h-[45px] px-4 py-2 rounded-md text-white ${
              uploadType === "album" ? "bg-blue-600" : "bg-blue-400"
            } hover:bg-blue-500`}
          >
            Album
          </Button>
        </div>
        <div className="mt-12">
          <div className="bg-[#1C1C32] flex flex-wrap gap-32 px-6 py-4 w-full h-[52px] sm:w-[500px] md:w-[726px] lg:w-[726px] xl:w-[980px] 2xl:w-[1000px] text-muted">
            <p className="lg:mr-40 md:mr-0 sm:mr-0">
              <span className="pr-4">#</span> Song Name
            </p>
            <p>Date Added</p>
            <p></p>
          </div>

          <Link
            href={`playlist/${1}`}
            className="mt-5 flex justify-between items-center align-middle w-full sm:w-[500px] md:w-[726px] py-1 px-4 group text-white hover:bg-[#950944] hover:rounded-md hover:cursor-pointer"
          >
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
          </Link>
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
      <MusicUpload
        modalOpen={modalOpen}
        setModalOpen={() => setModalOpen(false)}
        uploadType={uploadType}
        handleUpload={handleUpload}
      />
    </div>
  );
};

export default MyMusic;
