"use client";

import React, { useCallback } from "react";
import { MusicPlayerProvider, useMusicPlayer, Track } from "./MusicProvider";
import { useRecentlyPlayed } from "@/hooks/useRecentlyPlayed";

// Enhanced context that includes recently played functionality
interface EnhancedMusicPlayerContextType {
  // All original music player methods and properties
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  playlist: Track[] | null;
  currentIndex: number;
  currentPlaylistId: string | null;
  playTrack: (track: Track) => void;
  playPlaylist: (
    playlist: Track[],
    startIndex?: number,
    playlistId?: string
  ) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  buffering: boolean;
  networkStrength: "good" | "medium" | "poor" | "offline";
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
    networkType: string;
  };
  // Recently played functionality
  recentlyPlayed: Track[];
  isLoadingRecentlyPlayed: boolean;
  clearRecentlyPlayed: () => void;

  // Ad-related properties
  songsSinceAd: number;
  incrementSongCount: () => void;
  resetSongCount: () => void;
}

const EnhancedMusicPlayerContext = React.createContext<
  EnhancedMusicPlayerContextType | undefined
>(undefined);

export const useEnhancedMusicPlayer = () => {
  const context = React.useContext(EnhancedMusicPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useEnhancedMusicPlayer must be used within an EnhancedMusicPlayerProvider"
    );
  }
  return context;
};

// Internal component that provides the enhanced functionality
const EnhancedMusicPlayerProviderInternal = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const musicPlayer = useMusicPlayer();
  const {
    recentlyPlayed,
    isLoading: isLoadingRecentlyPlayed,
    addToRecentlyPlayed,
    clearRecentlyPlayed,
  } = useRecentlyPlayed();

  // Enhanced playTrack that also adds to recently played
  const enhancedPlayTrack = useCallback(
    (track: Track) => {
      // Call original playTrack
      musicPlayer.playTrack(track);
      // Add to recently played
      addToRecentlyPlayed(track);
    },
    [musicPlayer.playTrack, addToRecentlyPlayed]
  );

  // Enhanced playPlaylist that also adds the first track to recently played
  const enhancedPlayPlaylist = useCallback(
    (tracks: Track[], startIndex = 0, playlistId?: string) => {
      // Call original playPlaylist
      musicPlayer.playPlaylist(tracks, startIndex, playlistId);
      // Add the starting track to recently played
      if (tracks.length > 0 && tracks[startIndex]) {
        addToRecentlyPlayed(tracks[startIndex]);
      }
    },
    [musicPlayer.playPlaylist, addToRecentlyPlayed]
  );

  const value: EnhancedMusicPlayerContextType = {
    ...musicPlayer,
    playTrack: enhancedPlayTrack,
    playPlaylist: enhancedPlayPlaylist,
    recentlyPlayed,
    isLoadingRecentlyPlayed,
    clearRecentlyPlayed,
  };

  return (
    <EnhancedMusicPlayerContext.Provider value={value}>
      {children}
    </EnhancedMusicPlayerContext.Provider>
  );
};

// Main provider that wraps both MusicPlayerProvider and the enhanced functionality
export const EnhancedMusicPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <MusicPlayerProvider>
      <EnhancedMusicPlayerProviderInternal>
        {children}
      </EnhancedMusicPlayerProviderInternal>
    </MusicPlayerProvider>
  );
};

// Export the enhanced hook as the main hook to use
export { useEnhancedMusicPlayer as useMusicPlayer };

// Also export the original types for backward compatibility
export type { Track, Playlist } from "./MusicProvider";
