import { AdvanceRoute, DefaultRoute, WalletRoute } from "cartesi-router";
import { Error_out, Notice, Output } from "cartesi-wallet";

import { AlbumController } from "../controllers";

class CreateAlbumRoute extends AdvanceRoute {
  album: AlbumController;
  constructor(album: AlbumController) {
    super();
    this.album = album;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      const album = this.album.createAlbum({
        walletAddress: this.msg_sender,
        createdAt: new Date(request.metadata.timestamp * 1000),
        updatedAt: new Date(request.metadata.timestamp * 1000),
        releaseDate: new Date(request.metadata.timestamp * 1000),
        ...this.request_args,
      }) as Notice | Error_out;

      return album;
    } catch (error) {
      const error_msg = `Failed to create album ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class UpdateAlbumRoute extends AdvanceRoute {
  album: AlbumController;
  constructor(album: AlbumController) {
    super();
    this.album = album;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      console.log("Executing Update album request");
      return this.album.updateAlbum({
        walletAddress: this.msg_sender,
        updatedAt: new Date(request.metadata.timestamp * 1000),
        ...this.request_args,
      });
    } catch (error) {
      const error_msg = `Failed to update message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class DeleteAlbumRoute extends AdvanceRoute {
  album: AlbumController;
  constructor(album: AlbumController) {
    super();
    this.album = album;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    this._parse_request(request);
    try {
      return this.album.deleteAlbum(parseInt(this.request_args.albumId));
    } catch (error) {
      const error_msg = `Failed to delete message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class DeleteAlbumsRoute extends AdvanceRoute {
  album: AlbumController;
  constructor(album: AlbumController) {
    super();
    this.album = album;
  }
  _parse_request(request: any) {
    this.parse_request(request);
  }
  public execute = (request: any) => {
    try {
      return this.album.deleteAlbums();
    } catch (error) {
      const error_msg = `Failed to delete message ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  };
}

class InspectRoute extends DefaultRoute {
  album: AlbumController;
  constructor(album: AlbumController) {
    super();
    this.album = album;
  }
}

class AlbumsRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.album.getAlbums();
  };
}

class AlbumRoute extends InspectRoute {
  execute = (request: any): Output => {
    return this.album.getAlbum(parseInt(<string>request));
  };
}

export {
  UpdateAlbumRoute,
  DeleteAlbumRoute,
  DeleteAlbumsRoute,
  CreateAlbumRoute,
  AlbumsRoute,
  AlbumRoute,
};
