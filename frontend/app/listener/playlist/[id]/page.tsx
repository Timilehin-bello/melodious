"use client";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import AddTrackToPlaylistModal from "@/components/AddTrackToPlaylistModal";
import { Ellipsis, Play, Pause, Search } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { usePlaylist, useRemoveTrackFromPlaylist } from "@/hooks/usePlaylist";
import { Track } from "@/contexts/melodious/MusicProvider";
import { useMusicPlayer } from "@/contexts/melodious/MusicProvider";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import SongList from "@/components/SongList";

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
  const params = useParams();
  const id = params?.id as string;
  const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isPremiumUser } = useSubscriptionStatus();

  // Music player hooks
  const { currentTrack, isPlaying, playTrack, playPlaylist, togglePlay } =
    useMusicPlayer();

  const {
    data: playlistResponse,
    isLoading,
    error,
  } = usePlaylist(id as string);
  const playlist = playlistResponse?.data;

  // Remove track mutation
  const removeTrackMutation = useRemoveTrackFromPlaylist();

  // Transform playlist tracks to match Track interface
  const transformedTracks: Track[] =
    playlist?.tracks?.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artistId || "Unknown Artist",
      album: track.albumId || "Unknown Album",
      createdAt: track.createdAt,
      duration: parseInt(track.duration) || 0,
      imageUrl: track.imageUrl || "/images/artist.svg",
      audioUrl: track.audioUrl,
      artistId: track.artistId, // Add artistId for websocket
    })) || [];

  // Filter tracks based on search query
  const filteredTracks = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return transformedTracks;
    }

    const query = searchQuery.toLowerCase();
    return transformedTracks.filter((track: Track) =>
      track.title.toLowerCase().includes(query)
    );
  }, [transformedTracks, searchQuery]);

  // Handle play/pause functionality
  const handlePlayTrack = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else if (transformedTracks.length === 1) {
      playTrack(track);
    } else {
      playPlaylist(transformedTracks, index);
    }
  };

  const handleAddTrackSuccess = () => {
    // The modal will handle success actions and refetch
  };

  const handleRemoveTrack = (track: Track) => {
    if (!playlist?.id) return;

    removeTrackMutation.mutate({
      playlistId: playlist.id.toString(),
      data: {
        trackId: track.id.toString(),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="m-4 flex items-center justify-center min-h-[400px]">
        <div className="text-white text-lg">Loading playlist...</div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="m-4 flex items-center justify-center min-h-[400px]">
        <div className="text-white text-lg">Failed to load playlist</div>
      </div>
    );
  }
  return (
    <div className="m-4">
      <div className="flex flex-wrap items-center gap-8 bg-main-content-gradient bg-cover bg-center from-slate-400 to-lime-50 rounded-md  px-6 py-2 sm:px-4  sm:justify-center md:justify-start justify-center text-white">
        <div className="h-[236px] w-[251px] rounded-md bg-white p-2">
          <Image
            src={playlist.imageUrl || "/images/playlist.jpg"}
            alt="artist"
            width={256}
            height={281}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <h3>Playlist #{playlist.id}</h3>
          <h2 className="text-2xl lg:text-7xl md:text-5xl sm:text-3xl md:text-left sm:text-center text-center font-bold mb-2">
            {playlist.title}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {playlist.description || "No description"}
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <p>
              <span className="font-bold">
                {playlist.tracks?.length || 0} songs
              </span>
            </p>
            <p className="text-sm text-gray-400">
              Created {getTimeAgo(new Date(playlist.createdAt))}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-[url('/images/main_background.svg')] from-[#180526] to-[#180526] bg-cover bg-center rounded-lg p-6">
        {/* Main Action Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <button
              className="flex items-center justify-center w-16 h-16 rounded-full bg-[#950944] hover:bg-[#a50a4a] transition-colors duration-200 shadow-lg"
              onClick={() => {
                if (transformedTracks.length > 0) {
                  if (
                    isPlaying &&
                    currentTrack &&
                    transformedTracks.some(
                      (track) => track.id === currentTrack.id
                    )
                  ) {
                    togglePlay();
                  } else {
                    playPlaylist(transformedTracks, 0);
                  }
                }
              }}
            >
              {isPlaying &&
              currentTrack &&
              transformedTracks.some(
                (track) => track.id === currentTrack.id
              ) ? (
                <Pause size={28} fill="white" className="text-white" />
              ) : (
                <Play size={28} fill="white" className="text-white ml-1" />
              )}
            </button>
            <div className="text-white">
              <h3 className="text-lg font-semibold">
                {isPlaying &&
                currentTrack &&
                transformedTracks.some((track) => track.id === currentTrack.id)
                  ? "Pause"
                  : "Play All"}
              </h3>
              <p className="text-sm text-gray-400">
                {transformedTracks.length} tracks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPremiumUser && (
              <Button
                className="bg-[#950944] hover:bg-[#a50a4a] h-[45px] px-6 transition-colors duration-200"
                onClick={() => setIsAddTrackModalOpen(true)}
              >
                Add Track
              </Button>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tracks by title..."
          />
        </div>

        {isPremiumUser && (
          <AddTrackToPlaylistModal
            isOpen={isAddTrackModalOpen}
            onClose={() => setIsAddTrackModalOpen(false)}
            onSuccess={handleAddTrackSuccess}
            playlistId={id as string}
            playlistTitle={playlist.title}
            existingTracks={transformedTracks}
          />
        )}
        <div className="mt-12">
          {filteredTracks.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <Search className="mx-auto mb-4 h-12 w-12 text-zinc-500" />
              <p className="text-zinc-400 mb-4">
                No tracks found matching your search
              </p>
              <p className="text-zinc-500 text-sm">
                Try a different search term
              </p>
            </div>
          ) : (
            <SongList
              songList={filteredTracks}
              onPlayPause={handlePlayTrack}
              isLoading={isLoading}
              onRemove={handleRemoveTrack}
              showRemoveButton={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlist;
