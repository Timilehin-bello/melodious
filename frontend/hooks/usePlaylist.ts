import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import fetchMethod from "@/lib/readState";
import { useMelodiousContext } from "@/contexts/melodious";
import {
  Playlist,
  CreatePlaylistRequest,
  CreatePlaylistResponse,
  UpdatePlaylistRequest,
  UpdatePlaylistResponse,
  AddTrackToPlaylistRequest,
  AddTrackToPlaylistResponse,
  RemoveTrackFromPlaylistRequest,
  RemoveTrackFromPlaylistResponse,
  GetPlaylistsQuery,
  GetPlaylistsResponse,
  GetPlaylistResponse,
  UsePlaylistsOptions,
  UsePlaylistOptions,
} from "@/types/playlist";
import { toast } from "react-hot-toast";

// Query Keys
export const playlistKeys = {
  all: ["playlists"] as const,
  lists: () => [...playlistKeys.all, "list"] as const,
  list: (filters: GetPlaylistsQuery) =>
    [...playlistKeys.lists(), filters] as const,
  details: () => [...playlistKeys.all, "detail"] as const,
  detail: (id: string) => [...playlistKeys.details(), id] as const,
};

// Get user's playlists
export function usePlaylists(options: UsePlaylistsOptions = {}) {
  const {
    createdBy,
    isPublic,
    limit = 10,
    offset = 0,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: playlistKeys.list({ createdBy, isPublic, limit, offset }),
    queryFn: async (): Promise<GetPlaylistsResponse> => {
      const method = createdBy
        ? `get_playlists_by_wallet/${createdBy}`
        : "get_playlists";
      const response = await fetchMethod(method);
      console.log("get_playlists_by_wallet response", response);

      return {
        status: "success",
        data: {
          playlists: response || [],
          total: response.total || 0,
          limit,
          offset,
        },
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// Get single playlist by ID
export function usePlaylist(
  playlistId: string,
  options: Omit<UsePlaylistOptions, "playlistId"> = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: playlistKeys.detail(playlistId),
    queryFn: async (): Promise<GetPlaylistResponse> => {
      const response = await fetchMethod(`get_playlist/${playlistId}`);
      console.log("get_playlist response", response);
      return {
        status: "success",
        data: response,
      };
    },
    enabled: enabled && !!playlistId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Create new playlist
export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  const { signMessages } = useMelodiousContext();

  return useMutation({
    mutationFn: async (
      data: CreatePlaylistRequest
    ): Promise<CreatePlaylistResponse> => {
      const signedMessage = await signMessages({
        method: "create_playlist",
        args: data,
      });
      // For now, return a mock response until sendTransaction is available
      return {
        status: "success",
        message: "Playlist created successfully!",
        data: {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          createdBy: "current_user",
          isPublic: data.isPublic || false,
          tracks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    },
    onSuccess: (data) => {
      // Invalidate and refetch playlists
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      toast.success(data.message || "Playlist created successfully!");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create playlist";
      toast.error(errorMessage);
    },
  });
}

// Update playlist
export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  const { signMessages } = useMelodiousContext();

  return useMutation({
    mutationFn: async ({
      playlistId,
      data,
    }: {
      playlistId: string;
      data: UpdatePlaylistRequest;
    }): Promise<UpdatePlaylistResponse> => {
      const signedMessage = await signMessages({
        method: "update_playlist",
        args: {
          id: playlistId,
          ...data,
        },
      });
      // Mock response for now
      return {
        status: "success",
        message: "Playlist updated successfully!",
        data: {
          id: playlistId,
          title: data.title || "Updated Playlist",
          description: data.description,
          imageUrl: data.imageUrl,
          createdBy: "current_user",
          isPublic: data.isPublic || false,
          tracks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    },
    onSuccess: (data, variables) => {
      // Update the specific playlist in cache
      queryClient.setQueryData(
        playlistKeys.detail(variables.playlistId),
        data.data
      );
      // Invalidate playlists list
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      toast.success(data.message || "Playlist updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to update playlist";
      toast.error(errorMessage);
    },
  });
}

// Delete playlist
export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  const { signMessages } = useMelodiousContext();

  return useMutation({
    mutationFn: async (playlistId: string): Promise<void> => {
      await signMessages({
        method: "delete_playlist",
        args: {
          id: playlistId,
        },
      });
    },
    onSuccess: (_, playlistId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: playlistKeys.detail(playlistId) });
      // Invalidate playlists list
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      toast.success("Playlist deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to delete playlist";
      toast.error(errorMessage);
    },
  });
}

// Add track to playlist
export function useAddTrackToPlaylist() {
  const queryClient = useQueryClient();
  const { signMessages } = useMelodiousContext();

  return useMutation({
    mutationFn: async ({
      playlistId,
      data,
    }: {
      playlistId: string;
      data: AddTrackToPlaylistRequest;
    }): Promise<AddTrackToPlaylistResponse> => {
      const signedMessage = await signMessages({
        method: "add_track_to_playlist",
        args: {
          playlistId,
          ...data,
        },
      });
      // Mock response for now
      return {
        status: "success",
        message: "Track added to playlist!",
        data: {
          id: data.trackId,
          title: "Mock Track",
          imageUrl: "",
          audioUrl: "",
          lyrics: "",
          isrcCode: "",
          genreId: "",
          isPublished: true,
          albumId: "",
          artistId: "",
          duration: "0:00",
          trackNumber: "1",
          playLists: [playlistId],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific playlist to refetch with new track
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(variables.playlistId),
      });
      // Invalidate playlists list
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      toast.success(data.message || "Track added to playlist!");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to add track to playlist";
      toast.error(errorMessage);
    },
  });
}

// Remove track from playlist
export function useRemoveTrackFromPlaylist() {
  const queryClient = useQueryClient();
  const { signMessages } = useMelodiousContext();

  return useMutation({
    mutationFn: async ({
      playlistId,
      data,
    }: {
      playlistId: string;
      data: RemoveTrackFromPlaylistRequest;
    }): Promise<RemoveTrackFromPlaylistResponse> => {
      const signedMessage = await signMessages({
        method: "remove_track_from_playlist",
        args: {
          playlistId,
          trackId: data.trackId,
        },
      });
      // Mock response for now
      return {
        status: "success",
        message: "Track removed from playlist!",
      };
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific playlist to refetch without the track
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(variables.playlistId),
      });
      // Invalidate playlists list
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      toast.success(data.message || "Track removed from playlist!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "Failed to remove track from playlist";
      toast.error(errorMessage);
    },
  });
}
