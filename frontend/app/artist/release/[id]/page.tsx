"use client";
import AlbumRelease from "@/components/AlbumRelease";
import SingleRelease from "@/components/SingleRelease";
import { useParams } from "next/navigation";

const MusicUpload = () => {
  const route = useParams();

  return (
    <div className="m-4">
      <div className="w-full flex flex-wrap text-center  items-center gap-8 bg-gradient-to-b from-[#3D2250] to-[#1E1632] rounded-md  px-6 py-8 sm:px-4  sm:justify-center md:justify-center justify-center text-white">
        <div className="w-[550px]">
          <div className="mb-3 py-4 px-6">
            <h2 className="text-5xl">Create {route.id} Release</h2>
          </div>
          <p className="text-gray-400 px-6">
            Rlease all your music in one place Add new songs or manage released
            ones. Control your song data, rights holders, song splits and more
            from one convenient place.
          </p>
        </div>
      </div>

      <div className="bg-[#181425] rounded-lg p-12 text-white">
        {route.id === "single" ? <SingleRelease /> : ""}
        {route.id === "album" ? <AlbumRelease /> : ""}
      </div>
    </div>
  );
};

export default MusicUpload;
