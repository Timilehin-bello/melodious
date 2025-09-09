// Playlist Types
export interface Playlist {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdBy: string;
  isPublic: boolean;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  imageUrl: string;
  audioUrl: string;
  lyrics: string;
  isrcCode: string;
  genreId: string;
  isPublished: boolean;
  albumId: string;
  artistId: string;
  duration: string;
  trackNumber: string;
  playLists: string[];
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface CreatePlaylistRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
}

export interface CreatePlaylistResponse {
  status: string;
  message: string;
  data: Playlist;
}

export interface UpdatePlaylistRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
}

export interface UpdatePlaylistResponse {
  status: string;
  message: string;
  data: Playlist;
}

export interface AddTrackToPlaylistRequest {
  trackId: string;
  position?: number;
}

export interface AddTrackToPlaylistResponse {
  status: string;
  message: string;
  data: PlaylistTrack;
}

export interface RemoveTrackFromPlaylistRequest {
  trackId: string;
}

export interface RemoveTrackFromPlaylistResponse {
  status: string;
  message: string;
}

export interface GetPlaylistsQuery {
  createdBy?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetPlaylistsResponse {
  status: string;
  data: {
    playlists: Playlist[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface GetPlaylistResponse {
  status: string;
  data: Playlist;
}

// Hook Types
export interface UsePlaylistsOptions {
  createdBy?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export interface UsePlaylistOptions {
  playlistId: string;
  enabled?: boolean;
}

// Error Types
export interface PlaylistError {
  status: string;
  message: string;
  errors?: string[];
}

// Utility Types
export type PlaylistFormData = CreatePlaylistRequest;
export type PlaylistUpdateFormData = UpdatePlaylistRequest;
export type TrackFormData = AddTrackToPlaylistRequest;
