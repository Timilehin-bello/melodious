"use client";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  Play,
  Pause,
  Plus,
  Loader2,
  Music,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { usePlaylists, usePlaylist } from "@/hooks/usePlaylist";
import { useActiveAccount } from "thirdweb/react";
import AddPlaylistModal from "@/components/AddPlaylistModal";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { Track } from "@/contexts/melodious/MusicProvider";
import { useMusicPlayer } from "@/contexts/melodious/MusicProvider";
import fetchMethod from "@/lib/readState";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { isPremiumUser } = useSubscriptionStatus();

  // Music player hooks
  const {
    currentTrack,
    isPlaying,
    playTrack,
    playPlaylist,
    togglePlay,
    playlist,
    currentPlaylistId,
  } = useMusicPlayer();

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

  // Check if a playlist is currently playing
  const isPlaylistPlaying = (playlistId: string) => {
    return currentPlaylistId === playlistId && isPlaying;
  };

  // Handle playing a playlist
  const handlePlayPlaylist = async (playlistId: string) => {
    try {
      // Use the existing fetchMethod to get playlist data
      const playlist = await fetchMethod(`get_playlist/${playlistId}`);
      console.log("Playlist response:", playlist);

      if (!playlist?.tracks || playlist.tracks.length === 0) {
        console.log("No tracks found in playlist");
        return; // No tracks to play
      }

      // Transform tracks to match Track interface
      const transformedTracks: Track[] = playlist.tracks.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.artistId || "Unknown Artist",
        album: track.albumId || "Unknown Album",
        createdAt: track.createdAt,
        duration: track.duration || 0,
        imageUrl: track.imageUrl || "/images/artist.svg",
        audioUrl: track.audioUrl,
        artistId: track.artistId,
      }));

      console.log("Transformed tracks:", transformedTracks);

      // Start playing the playlist from the first track
      playPlaylist(transformedTracks, 0, playlistId);
    } catch (error) {
      console.log("Failed to play playlist:", error);
    }
  };

  const playlists = React.useMemo(
    () => playlistsData?.data?.playlists || [],
    [playlistsData]
  );

  // Filter playlists based on search query
  const filteredPlaylists = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return playlists;
    }

    const query = searchQuery.toLowerCase();
    return playlists.filter((playlist: any) =>
      playlist.title.toLowerCase().includes(query)
    );
  }, [playlists, searchQuery]);
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
        {/* Play Controls and Add Playlist Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[#950944] hover:bg-[#a50a4a] transition-colors duration-200"
              onClick={() => {
                // Handle play all playlists functionality if needed
                console.log("Play all playlists");
              }}
            >
              <Play size={28} fill="white" className="text-white ml-1" />
            </button>
            <div className="text-white">
              <h3 className="text-lg font-semibold">Play All</h3>
              <p className="text-sm text-gray-400">
                {playlists.length} playlists
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPremiumUser && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#950944] hover:bg-[#a50a4a] h-[45px] px-6 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Playlist
              </Button>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search playlists by title..."
          />
        </div>

        {isPremiumUser && (
          <AddPlaylistModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleModalSuccess}
          />
        )}
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
          ) : filteredPlaylists.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <Search className="mx-auto mb-4 h-12 w-12 text-zinc-500" />
              ) : (
                <Music className="mx-auto mb-4 h-12 w-12 text-zinc-500" />
              )}
              <p className="text-zinc-400 mb-4">
                {searchQuery
                  ? "No playlists found matching your search"
                  : "No playlists found"}
              </p>
              <p className="text-zinc-500 text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first playlist to get started!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredPlaylists.map((playlist, index) => {
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
                        {playlist.tracks && playlist.tracks.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault(); // Prevent navigation to playlist page
                              if (isPlaylistPlaying(playlist.id)) {
                                togglePlay(); // Pause if currently playing
                              } else {
                                handlePlayPlaylist(playlist.id); // Play if not playing
                              }
                            }}
                            className="absolute bottom-2 right-2  bg-[#950944] hover:bg-[#b30d52]  ease-out shadow-lg hover:shadow-[#950944]/25 transform hover:scale-110 active:scale-95 group-hover:translate-y-0 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            {isPlaylistPlaying(playlist.id) ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}
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
