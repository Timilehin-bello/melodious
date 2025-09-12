import { AdvanceRoute, DefaultRoute } from "cartesi-router";
import { Error_out, Log, Output } from "cartesi-wallet";
import { PlaylistController } from "../controllers/playlist.controller";

class CreatePlaylistRoute extends AdvanceRoute {
  playlist: PlaylistController;
  constructor(playlist: PlaylistController) {
    super();
    this.playlist = playlist;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      const playlistData = {
        ...this.request_args,
        walletAddress: this.msg_sender,
        timestamp: this.msg_timestamp,
      };
      return this.playlist.create(playlistData);
    } catch (error) {
      const error_msg = `Failed to create playlist: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class UpdatePlaylistRoute extends AdvanceRoute {
  playlist: PlaylistController;
  constructor(playlist: PlaylistController) {
    super();
    this.playlist = playlist;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      const playlistData = {
        ...this.request_args,
        walletAddress: this.msg_sender,
        timestamp: this.msg_timestamp,
      };
      return this.playlist.updatePlaylist(playlistData);
    } catch (error) {
      const error_msg = `Failed to update playlist: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class DeletePlaylistRoute extends AdvanceRoute {
  playlist: PlaylistController;
  constructor(playlist: PlaylistController) {
    super();
    this.playlist = playlist;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.playlist.deletePlaylist(
        parseInt(this.request_args.playlistId),
        this.msg_sender
      );
    } catch (error) {
      const error_msg = `Failed to delete playlist: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class AddTrackToPlaylistRoute extends AdvanceRoute {
  playlist: PlaylistController;
  constructor(playlist: PlaylistController) {
    super();
    this.playlist = playlist;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.playlist.addTrackToPlaylist(
        parseInt(this.request_args.playlistId),
        parseInt(this.request_args.trackId),
        this.msg_sender
      );
    } catch (error) {
      const error_msg = `Failed to add track to playlist: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class RemoveTrackFromPlaylistRoute extends AdvanceRoute {
  playlist: PlaylistController;
  constructor(playlist: PlaylistController) {
    super();
    this.playlist = playlist;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.playlist.removeTrackFromPlaylist(
        parseInt(this.request_args.playlistId),
        parseInt(this.request_args.trackId),
        this.msg_sender
      );
    } catch (error) {
      const error_msg = `Failed to remove track from playlist: ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

// Inspect routes for reading data
class InspectRoute extends DefaultRoute {
  playlist: PlaylistController;
  constructor(playlist: PlaylistController) {
    super();
    this.playlist = playlist;
  }
}

class PlaylistsRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.playlist.getPlaylists();
  };
}

class PlaylistRoute extends InspectRoute {
  execute = (request: any): Output => {
    const playlistId = parseInt(request as string);
    const playlist = this.playlist.getPlaylistById(playlistId);
    if (!playlist) {
      return new Error_out(`Playlist with ID ${playlistId} not found`);
    }
    return new Log(JSON.stringify(playlist));
  };
}

class PlaylistsByListenerRoute extends InspectRoute {
  execute = (request: any): Output => {
    const listenerId = parseInt(request as string);
    return this.playlist.getPlaylistsByListener(listenerId);
  };
}

class PlaylistsByWalletRoute extends InspectRoute {
  execute = (request: any): Output => {
    const walletAddress = request as string;
    return this.playlist.getPlaylistsByWallet(walletAddress);
  };
}

export {
  CreatePlaylistRoute,
  UpdatePlaylistRoute,
  DeletePlaylistRoute,
  AddTrackToPlaylistRoute,
  RemoveTrackFromPlaylistRoute,
  PlaylistsRoute,
  PlaylistRoute,
  PlaylistsByListenerRoute,
  PlaylistsByWalletRoute,
};
