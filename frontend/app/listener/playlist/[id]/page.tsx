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
import React, { useState } from "react";
import { usePlaylist, useAddTrackToPlaylist } from "@/hooks/usePlaylist";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "react-hot-toast";
import { Track } from "@/contexts/melodious/MusicProvider";
import { useMusicPlayer } from "@/contexts/melodious/MusicProvider";
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
  const activeAccount = useActiveAccount();
  const [trackId, setTrackId] = useState("");
  const [isAddTrackDialogOpen, setIsAddTrackDialogOpen] = useState(false);

  // Music player hooks
  const { currentTrack, isPlaying, playTrack, playPlaylist, togglePlay } =
    useMusicPlayer();

  const {
    data: playlistResponse,
    isLoading,
    error,
  } = usePlaylist(id as string);
  const playlist = playlistResponse?.data;

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

  const addTrackMutation = useAddTrackToPlaylist();

  const handleAddTrack = async () => {
    if (!trackId.trim() || !activeAccount?.address || !id) {
      toast.error("Please enter a track ID");
      return;
    }

    try {
      await addTrackMutation.mutateAsync({
        playlistId: id as string,
        data: {
          trackId: trackId.trim(),
        },
      });
      setTrackId("");
      setIsAddTrackDialogOpen(false);
      toast.success("Track added to playlist!");
    } catch (error) {
      console.error("Failed to add track:", error);
    }
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
            src="/images/artist.svg"
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

      <div className="mt-10 bg-[url('/images/main_background.svg')] from-[#180526] to-[#180526] bg-cover bg-center rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center justify-center  w-12 h-12 rounded-full bg-[#950944]">
            <Play size={24} fill="white" className=" text-white" />
          </div>
          <SearchInput />

          <Dialog
            open={isAddTrackDialogOpen}
            onOpenChange={setIsAddTrackDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#950944] h-[45px]">Add Track</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#212121] border-none text-white ">
              <DialogHeader>
                <DialogTitle>Add Track to Playlist</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="trackId"
                    placeholder="Track ID"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    className="col-span-3 w-[380px] border-b-2 border-gray-300 focus:outline-none focus:border-b-2  focus:ring-0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setIsAddTrackDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-[#950944]"
                  onClick={handleAddTrack}
                  disabled={addTrackMutation.isPending}
                >
                  {addTrackMutation.isPending ? "Adding..." : "Add Track"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-12">
          <SongList
            songList={transformedTracks}
            onPlayPause={handlePlayTrack}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Playlist;
