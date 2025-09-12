"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Track } from "@/contexts/melodious/MusicProviderWithRecentlyPlayed";
import { useActiveAccount } from "thirdweb/react";
import Cookies from "js-cookie";

const RECENTLY_PLAYED_LIMIT = 10;

// Helper function to get the storage key for user-specific recently played
const getRecentlyPlayedKey = (address: string) => {
  return `melodious-recently-played-${address}`;
};

// Helper function to get recently played from cookies
const getRecentlyPlayedFromCookies = (address: string): Track[] => {
  try {
    const key = getRecentlyPlayedKey(address);
    const data = Cookies.get(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error parsing recently played from cookies:", error);
    return [];
  }
};

// Helper function to save recently played to cookies
const saveRecentlyPlayedToCookies = (address: string, tracks: Track[]) => {
  try {
    const key = getRecentlyPlayedKey(address);
    Cookies.set(key, JSON.stringify(tracks), {
      expires: 30, // 30 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("Error saving recently played to cookies:", error);
  }
};

export const useRecentlyPlayed = () => {
  const activeAccount = useActiveAccount();
  const queryClient = useQueryClient();
  const address = activeAccount?.address;

  // Query to get recently played tracks
  const {
    data: recentlyPlayed = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recently-played", address],
    queryFn: () => {
      if (!address) return [];
      return getRecentlyPlayedFromCookies(address);
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Mutation to add a track to recently played
  const addToRecentlyPlayedMutation = useMutation({
    mutationFn: async (track: Track) => {
      if (!address) throw new Error("No wallet connected");

      const currentTracks = getRecentlyPlayedFromCookies(address);

      // Remove if already exists to avoid duplicates
      const filteredTracks = currentTracks.filter((t) => t.id !== track.id);

      // Add to beginning and limit to RECENTLY_PLAYED_LIMIT
      const updatedTracks = [track, ...filteredTracks].slice(
        0,
        RECENTLY_PLAYED_LIMIT
      );

      // Save to cookies
      saveRecentlyPlayedToCookies(address, updatedTracks);

      return updatedTracks;
    },
    onSuccess: (updatedTracks) => {
      // Update the query cache
      queryClient.setQueryData(["recently-played", address], updatedTracks);
    },
    onError: (error) => {
      console.error("Error adding track to recently played:", error);
    },
  });

  // Mutation to clear recently played
  const clearRecentlyPlayedMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("No wallet connected");

      const key = getRecentlyPlayedKey(address);
      Cookies.remove(key);

      return [];
    },
    onSuccess: () => {
      // Update the query cache
      queryClient.setQueryData(["recently-played", address], []);
    },
    onError: (error) => {
      console.error("Error clearing recently played:", error);
    },
  });

  return {
    recentlyPlayed,
    isLoading,
    error,
    addToRecentlyPlayed: addToRecentlyPlayedMutation.mutate,
    clearRecentlyPlayed: clearRecentlyPlayedMutation.mutate,
    isAddingTrack: addToRecentlyPlayedMutation.isPending,
    isClearing: clearRecentlyPlayedMutation.isPending,
  };
};

export default useRecentlyPlayed;
