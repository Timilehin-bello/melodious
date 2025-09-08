"use client";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Ellipsis, Play, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { usePlaylists } from "@/hooks/usePlaylist";
import { useActiveAccount } from "thirdweb/react";
import AddPlaylistModal from "@/components/AddPlaylistModal";

// Utility function to format time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "1 day ago";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
};

const Playlist = () => {
  const activeAccount = useActiveAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user's playlists
  const {
    data: playlistsData,
    isLoading,
    error,
    refetch,
  } = usePlaylists({
    createdBy: activeAccount?.address,
    enabled: !!activeAccount?.address,
  });

  const handleModalSuccess = () => {
    refetch(); // Refresh the playlists after creation
  };

  const playlists = playlistsData?.data?.playlists || [];
  return (
    <div className="m-4">
      <div className="flex flex-wrap items-center gap-8 bg-gradient-to-b from-[#3D2250] to-[#1E1632] rounded-md  px-6 py-8 sm:px-4  sm:justify-center md:justify-start justify-center text-white">
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
          <h2 className="text-2xl lg:text-7xl md:text-5xl sm:text-3xl md:text-left sm:text-center text-center font-bold mb-2">
            Your Playlist
          </h2>
          <div className="flex flex-wrap gap-4 px-4">
            <div className="flex gap-2">
              <Image
                src="/images/artist.svg"
                width={12}
                height={12}
                alt="artist"
                className="rounded-full"
              />
              <p>Raza</p>
            </div>
            <p>
              <span className="font-bold">10 songs,</span> 24 min 38 sec
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

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#950944] hover:bg-[#950944]/90 text-white px-6 py-2 rounded-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Playlist
          </Button>

          <AddPlaylistModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleModalSuccess}
          />
        </div>
        {/* Playlist Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <span className="ml-2 text-zinc-400">Loading playlists...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Failed to load playlists</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                Try Again
              </Button>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 mb-4">No playlists found</p>
              <p className="text-zinc-500 text-sm">
                Create your first playlist to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {playlists.map((playlist, index) => {
                const createdDate = new Date(playlist.createdAt);
                const timeAgo = getTimeAgo(createdDate);

                return (
                  <Link
                    key={playlist.id}
                    href={`/listener/playlist/${playlist.id}`}
                    className="group"
                  >
                    <div className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer">
                      <div className="relative mb-4">
                        <Image
                          src={playlist.imageUrl || "/images/playlist.jpg"}
                          alt={playlist.title}
                          width={200}
                          height={200}
                          className="w-full aspect-square object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/playlist.jpg";
                          }}
                        />
                        <button className="absolute bottom-2 right-2  bg-[#950944] hover:bg-[#b30d52]  ease-out shadow-lg hover:shadow-[#950944]/25 transform hover:scale-110 active:scale-95 group-hover:translate-y-0 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-white font-medium mb-1 truncate">
                        {playlist.title}
                      </h3>
                      <p className="text-zinc-400 text-sm mb-2">
                        Created {timeAgo}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs">
                          {playlist.tracks?.length || 0} songs
                        </span>
                        <button className="text-zinc-400 hover:text-white">
                          <Ellipsis className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlist;
