import { Error_out, Log, Notice } from "cartesi-wallet";
import { Playlist } from "../models";
import { RepositoryService } from "../services";
import { UserController } from "./user.controller";
import { walletActions } from "viem";

class PlaylistController {
  public create(playlistBody: {
    title: string;
    description?: string;
    imageUrl?: string;
    isPublic?: boolean;
    walletAddress: string;
    timestamp: number;
  }) {
    try {
      // Verify wallet address matches listener's wallet
      const user = new UserController().getUserByUniqueValue({
        key: "walletAddress",
        value: playlistBody.walletAddress.toLowerCase(),
      });

      if (!user) {
        return new Error_out(
          `User with walletAddress ${playlistBody.walletAddress} is not a user`
        );
      }

      // Check if listener exists
      const listener = RepositoryService.listeners.find(
        (l) => l.id === user?.listener?.id
      );
      if (!listener) {
        return new Error_out(
          `Listener with walletAddress ${playlistBody.walletAddress} is not a listener`
        );
      }

      const playlist = new Playlist(
        playlistBody.title,
        playlistBody.imageUrl || null,
        playlistBody.description || null,
        listener.id,
        playlistBody.walletAddress.toLowerCase(),
        new Date(playlistBody.timestamp * 1000),
        new Date(playlistBody.timestamp * 1000),
        playlistBody.isPublic ?? true
      );

      RepositoryService.playlists.push(playlist);

      console.log(
        `Playlist "${playlist.title}" created for listener ${playlist.listenerId}`
      );

      // Create repository notice with playlist creation data
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "playlist_created",
        playlist
      );

      // Also create specific playlist notice
      const playlistNotice = RepositoryService.createDataNotice(
        "playlists",
        "created",
        playlist
      );

      return repositoryNotice;
    } catch (error) {
      const error_msg = `Failed to create Playlist: ${error}`;
      console.debug("Create Playlist", error_msg);
      return new Error_out(error_msg);
    }
  }

  public updatePlaylist(playlistBody: {
    id: number;
    title?: string;
    imageUrl?: string;
    description?: string;
    isPublic?: boolean;
    walletAddress: string;
    timestamp: number;
  }) {
    try {
      const playlist = this.getPlaylistById(playlistBody.id);
      if (!playlist) {
        return new Error_out(`Playlist with ID ${playlistBody.id} not found`);
      }

      // Verify ownership
      if (
        playlist.walletAddress.toLowerCase() !==
        playlistBody.walletAddress.toLowerCase()
      ) {
        return new Error_out("Only the playlist owner can update it");
      }

      // Validate IPFS URL if provided
      // if (
      //   playlistBody.imageUrl &&
      //   !Playlist.isValidIPFSUrl(playlistBody.imageUrl)
      // ) {
      //   return new Error_out("Invalid IPFS URL format for playlist image");
      // }

      // Update playlist properties
      if (playlistBody.title !== undefined) playlist.title = playlistBody.title;
      if (playlistBody.imageUrl !== undefined)
        playlist.imageUrl = playlistBody.imageUrl;
      if (playlistBody.description !== undefined)
        playlist.description = playlistBody.description;
      if (playlistBody.isPublic !== undefined)
        playlist.public = playlistBody.isPublic;
      playlist.updatedAt = new Date(playlistBody.timestamp * 1000);

      console.log(`Playlist "${playlist.title}" updated`);

      // Create repository notice with playlist update data
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "playlist_updated",
        playlist
      );

      // Also create specific playlist notice
      const playlistNotice = RepositoryService.createDataNotice(
        "playlists",
        "updated",
        playlist
      );

      return repositoryNotice;
    } catch (error) {
      const error_msg = `Failed to update Playlist: ${error}`;
      console.debug("Update Playlist", error_msg);
      return new Error_out(error_msg);
    }
  }

  public deletePlaylist(playlistId: number, walletAddress: string) {
    try {
      const playlistIndex = RepositoryService.playlists.findIndex(
        (p) => p.id === playlistId
      );
      if (playlistIndex === -1) {
        return new Error_out(`Playlist with ID ${playlistId} not found`);
      }

      const playlist = RepositoryService.playlists[playlistIndex];

      // Verify ownership
      if (
        playlist?.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
      ) {
        return new Error_out("Only the playlist owner can delete it");
      }

      RepositoryService.playlists.splice(playlistIndex, 1);

      console.log(`Playlist with ID ${playlistId} deleted`);

      // Create repository notice with playlist deletion data
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "playlist_deleted",
        playlist
      );

      // Also create specific playlist notice
      const playlistNotice = RepositoryService.createDataNotice(
        "playlists",
        "deleted",
        playlist
      );

      return repositoryNotice;
    } catch (error) {
      const error_msg = `Failed to delete Playlist: ${error}`;
      console.debug("Delete Playlist", error_msg);
      return new Error_out(error_msg);
    }
  }

  public getPlaylists() {
    try {
      const playlists_json = JSON.stringify(RepositoryService.playlists);
      return new Log(playlists_json);
    } catch (error) {
      const error_msg = `Failed to get playlists: ${error}`;
      console.debug("Get Playlists", error_msg);
      return new Error_out(error_msg);
    }
  }

  public getPlaylistById(playlistId: number): Playlist | undefined {
    return RepositoryService.playlists.find((p) => p.id === playlistId);
  }

  public getPlaylistsByListener(listenerId: number) {
    try {
      const playlists = RepositoryService.playlists.filter(
        (p) => p.listenerId === listenerId
      );
      const playlists_json = JSON.stringify(playlists);
      return new Log(playlists_json);
    } catch (error) {
      const error_msg = `Failed to get playlists for listener ${listenerId}: ${error}`;
      console.debug("Get Playlists by Listener", error_msg);
      return new Error_out(error_msg);
    }
  }

  public getPlaylistsByWallet(walletAddress: string) {
    try {
      const playlists = RepositoryService.playlists.filter(
        (p) => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
      const playlists_json = JSON.stringify(playlists);
      return new Log(playlists_json);
    } catch (error) {
      const error_msg = `Failed to get playlists for wallet ${walletAddress}: ${error}`;
      console.debug("Get Playlists by Wallet", error_msg);
      return new Error_out(error_msg);
    }
  }

  public addTrackToPlaylist(
    playlistId: number,
    trackId: number,
    walletAddress: string
  ) {
    try {
      const playlist = this.getPlaylistById(playlistId);
      if (!playlist) {
        return new Error_out(`Playlist with ID ${playlistId} not found`);
      }

      // Verify ownership
      if (
        playlist.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
      ) {
        return new Error_out("Only the playlist owner can add tracks");
      }

      const track = RepositoryService.tracks.find((t) => t.id === trackId);
      if (!track) {
        return new Error_out(`Track with ID ${trackId} not found`);
      }

      // Check if track is already in playlist
      if (playlist.tracks.some((t) => t.id === trackId)) {
        return new Error_out("Track is already in the playlist");
      }

      playlist.addTrack(track);

      console.log(`Track ${trackId} added to playlist ${playlistId}`);

      // Create repository notice with track addition data
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "track_added_to_playlist",
        {
          playlist,
          track,
          action: "add_track",
        }
      );

      return repositoryNotice;
    } catch (error) {
      const error_msg = `Failed to add track to playlist: ${error}`;
      console.debug("Add Track to Playlist", error_msg);
      return new Error_out(error_msg);
    }
  }

  public removeTrackFromPlaylist(
    playlistId: number,
    trackId: number,
    walletAddress: string
  ) {
    try {
      const playlist = this.getPlaylistById(playlistId);
      if (!playlist) {
        return new Error_out(`Playlist with ID ${playlistId} not found`);
      }

      // Verify ownership
      if (
        playlist.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
      ) {
        return new Error_out("Only the playlist owner can remove tracks");
      }

      // Check if track exists in playlist
      if (!playlist.tracks.some((t) => t.id === trackId)) {
        return new Error_out("Track is not in the playlist");
      }

      playlist.removeTrack(trackId);

      console.log(`Track ${trackId} removed from playlist ${playlistId}`);

      // Create repository notice with track removal data
      const repositoryNotice = RepositoryService.createRepositoryNotice(
        "track_removed_from_playlist",
        {
          playlist,
          trackId,
          action: "remove_track",
        }
      );

      return repositoryNotice;
    } catch (error) {
      const error_msg = `Failed to remove track from playlist: ${error}`;
      console.debug("Remove Track from Playlist", error_msg);
      return new Error_out(error_msg);
    }
  }
}

export { PlaylistController };
