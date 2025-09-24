import { useMemo } from "react";
import { useRepositoryData } from "./useNoticesQuery";
import { useUserByWallet } from "./useUserByWallet";

export interface Track {
  id: number;
  title: string;
  artistId: string;
  albumId?: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  createdAt?: string;
  updatedAt?: string;
  walletAddress?: string;
}

/**
 * Hook to get all tracks from repository notices
 * @returns Object containing tracks array, loading state, error state, and utility functions
 */
export function useTracks() {
  const {
    tracks: tracksFromRepository,
    isLoading,
    isError,
    error,
    refetch,
  } = useRepositoryData();

  const tracks = useMemo(() => {
    // Use tracks directly from repository data
    return tracksFromRepository || [];
  }, [tracksFromRepository]);

  return {
    tracks,
    isLoading,
    isError,
    error,
    refetch,
    // Utility functions
    getTrackById: (id: number) =>
      tracks.find((track: Track) => track.id === id),
    getTracksByArtist: (artistId: string) =>
      tracks.filter((track: Track) => track.artistId === artistId),
    getTracksByWallet: (walletAddress: string) => {
      console.log("Track found:", tracks);
      return tracks.filter(
        (track: Track) =>
          track.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
      );
    },
    hasTracks: tracks.length > 0,
  };
}

/**
 * Hook to get a specific track by ID
 * @param id Track ID to fetch
 * @returns Object containing track data, loading state, and error state
 */
export function useTrackById(id: number | undefined) {
  const { tracks, isLoading, isError, error } = useTracks();

  const track = useMemo(() => {
    if (!id || !tracks.length) return undefined;
    return tracks.find((track: Track) => track.id === id);
  }, [id, tracks]);

  return {
    track,
    isLoading,
    isError,
    error,
    isFound: !!track,
  };
}

/**
 * Hook to get tracks by artist ID
 * @param artistId Artist ID to filter tracks
 * @returns Object containing filtered tracks, loading state, and error state
 */
export function useTracksByArtist(artistId: string | undefined) {
  const { tracks, isLoading, isError, error } = useTracks();

  const artistTracks = useMemo(() => {
    if (!artistId || !tracks.length) return [];
    return tracks.filter((track: Track) => track.artistId === artistId);
  }, [artistId, tracks]);

  return {
    tracks: artistTracks,
    isLoading,
    isError,
    error,
    hasTracks: artistTracks.length > 0,
  };
}

/**
 * Hook to get tracks by artist wallet address with artist details
 * Similar to the logic used in NFT management page
 * @param walletAddress Artist wallet address
 * @returns Object containing filtered tracks with artist details, loading state, and error state
 */
export function useTracksByArtistWallet(walletAddress: string | undefined) {
  const { tracks: allTracks, isLoading: tracksLoading, isError, error } = useTracks();
  const { user: artistUser, isLoading: userLoading } = useUserByWallet(walletAddress);

  const tracks = useMemo(() => {
    if (!allTracks || !artistUser?.artist) return [];

    const artistTracks = allTracks.filter(
      (track: Track) => track.artistId === artistUser.artist.id
    );

    // Format tracks to include artist details
    return artistTracks.map((track: Track) => ({
      ...track,
      artist: artistUser.displayName || artistUser.name,
      artistDetails: {
        id: artistUser.artist.id,
        name: artistUser.name,
        displayName: artistUser.displayName,
        profileImage: artistUser.profileImage,
        biography: artistUser.artist.biography,
        socialMediaLinks: artistUser.artist.socialMediaLinks,
      },
    }));
  }, [allTracks, artistUser]);

  return {
    tracks,
    isLoading: tracksLoading || userLoading,
    isError,
    error,
    hasTracks: tracks.length > 0,
    artistUser,
  };
}
