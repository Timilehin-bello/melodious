"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect, useMemo } from "react";
import { X, Search, Play, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Track } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { useTracks } from "@/hooks/useTracks";
import { useAddTrackToPlaylist } from "@/hooks/usePlaylist";
import { toast } from "react-hot-toast";
import { useActiveAccount } from "thirdweb/react";
import BlockLoader from "./BlockLoader";

interface AddTrackToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  playlistId: string;
  playlistTitle: string;
  existingTracks?: Track[];
}

const AddTrackToPlaylistModal: React.FC<AddTrackToPlaylistModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  playlistId,
  playlistTitle,
  existingTracks = [],
}) => {
  const { tracks: allTracks, isLoading, isError, error } = useTracks();
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const activeAccount = useActiveAccount();
  const addTrackMutation = useAddTrackToPlaylist();

  const tracks = allTracks || [];

  useEffect(() => {
    if (isError) {
      console.error("Error fetching tracks:", error);
      toast.error("Failed to load tracks");
    }
  }, [isError, error]);

  // Filter tracks based on search query (title only) and exclude already added tracks
  const filteredTracks = useMemo(() => {
    let filtered = tracks;

    // Exclude tracks that are already in the playlist
    const existingTrackIds = new Set(
      existingTracks.map((track: Track) => track.id)
    );
    filtered = filtered.filter(
      (track: Track) => !existingTrackIds.has(track.id)
    );

    // Filter by search query (title only)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((track: Track) =>
        track.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tracks, searchQuery, existingTracks]);

  const handleTrackSelect = (trackId: string) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
  };

  const handleAddTracks = async () => {
    if (selectedTracks.size === 0) {
      toast.error("Please select at least one track");
      return;
    }

    if (!activeAccount?.address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Add tracks one by one (you might want to batch this in the backend)
      for (const trackId of selectedTracks) {
        await addTrackMutation.mutateAsync({
          playlistId,
          data: { trackId },
        });
      }

      setSelectedTracks(new Set());
      setSearchQuery("");
      onSuccess();
      onClose();
    } catch (error) {
      console.log("Failed to add tracks:", error);
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    setSelectedTracks(new Set());
    setSearchQuery("");
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[#181425] p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center mb-6"
                >
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      Add Tracks to Playlist
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {playlistTitle}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                {/* Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tracks by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400"
                  />
                </div>

                {/* Selected tracks count */}
                {selectedTracks.size > 0 && (
                  <div className="mb-4 p-3 bg-[#950944]/20 rounded-lg border border-[#950944]/30">
                    <p className="text-white text-sm">
                      {selectedTracks.size} track(s) selected
                    </p>
                  </div>
                )}

                {/* Tracks List */}
                <div className="max-h-96 overflow-y-auto mb-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <BlockLoader message="Loading tracks..." />
                    </div>
                  ) : filteredTracks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">
                        {searchQuery
                          ? "No tracks found matching your search"
                          : tracks.length === 0
                          ? "No tracks available"
                          : "All available tracks are already in this playlist"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTracks.map((track: Track) => {
                        const isSelected = selectedTracks.has(track.id);
                        return (
                          <div
                            key={track.id}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#950944]/20 border border-[#950944]/50"
                                : "bg-white/5 hover:bg-white/10 border border-transparent"
                            }`}
                            onClick={() => handleTrackSelect(track.id)}
                          >
                            {/* Track Image */}
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={track.imageUrl || "/images/artist.svg"}
                                alt={track.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            {/* Track Info */}
                            <div className="flex-1 ml-3 min-w-0">
                              <h4 className="text-white font-medium truncate">
                                {track.title}
                              </h4>
                              <p className="text-gray-400 text-sm truncate">
                                {track.artist}
                                {track.album && ` • ${track.album}`}
                              </p>
                            </div>

                            {/* Duration */}
                            <div className="text-gray-400 text-sm mr-3">
                              {track.duration}
                            </div>

                            {/* Selection Indicator */}
                            <div className="flex-shrink-0">
                              {isSelected ? (
                                <div className="w-6 h-6 bg-[#950944] rounded-full flex items-center justify-center">
                                  <Plus className="w-4 h-4 text-white rotate-45" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 border-2 border-gray-400 rounded-full" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-white/10 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddTracks}
                    className="flex-1 bg-[#950944] text-white hover:bg-[#950944]/90"
                    disabled={
                      selectedTracks.size === 0 || addTrackMutation.isPending
                    }
                  >
                    {addTrackMutation.isPending
                      ? "Adding..."
                      : `Add ${
                          selectedTracks.size > 0 ? selectedTracks.size : ""
                        } Track${selectedTracks.size !== 1 ? "s" : ""}`}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddTrackToPlaylistModal;
