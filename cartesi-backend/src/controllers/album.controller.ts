import { Error_out, Log, Notice } from "cartesi-wallet";
import { Album, User } from "../models";

import { UserController } from "./user.controller";

const user = new UserController();

class AlbumController {
  albums: Album[];

  constructor() {
    this.albums = [];
  }

  create(albumBody: { album: Album; walletAddress: string }) {
    const findUser: User | any = user.getUserByUniqueValue({
      key: "walletAddress",
      value: albumBody.walletAddress,
    });
    if (!findUser) {
      return new Error_out("User with wallet address does not exist");
    }

    try {
      const album = new Album(
        albumBody.album.title,
        findUser.artist.id,
        albumBody.album.releaseDate,
        albumBody.album.coverImageUrl,
        albumBody.album.totalTracks,
        albumBody.album.label,
        albumBody.album.genreId,
        albumBody.album.isPublished,
        albumBody.album.tracks
      );

      return new Notice(`{{"type":"create_album","content"}}`);
    } catch (error) {
      const error_msg = `Failed to create User ${error}`;
      console.debug("Create User", error_msg);
      return new Error_out(error_msg);
    }
  }

  updateAlbum(
    currentWalletAddress: string,
    timestamp: number,
    albumBody: Partial<User>
  ) {
    try {
      return new Notice("notice_payload");
    } catch (error) {
      console.debug("Error updating user", error);
      return new Error_out(`Failed to update user with id ${albumBody.id}`);
    }
  }

  getAlbums() {
    try {
      // const albums = this.fileHelper.readFile<User>(); // Read directly from file
      // console.log("Get albums from God", JSON.stringify(albums));
      const albums_json = JSON.stringify(this.albums);
      console.log("albums", albums_json);
      return new Log(albums_json);
    } catch (error) {
      const error_msg = `Failed to get albums ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  getAlbum(user_id: number) {
    try {
      let user_json = JSON.stringify(this.albums[user_id]);
      console.log("User", user_json);
      return new Log(user_json);
    } catch (error) {
      return new Error_out(`User with id ${user_id} not found`);
    }
  }

  deleteAlbum(user_id: number) {
    try {
      const user = this.getAlbumById({ id: user_id });
      if (!user) {
        return new Error_out(`User with id ${user_id} not found`);
      }

      this.albums = this.albums.filter((u) => u.id !== user_id);

      console.log("User deleted", user);

      const user_json = JSON.stringify(user);
      console.log("Deleting User", user_json);

      const notice_payload = `{{"type":"delete_user","content":${user_json} }}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error deleting user", error);
      return new Error_out(`Failed to delete user with id ${user_id}`);
    }
  }

  deleteAlbums() {
    try {
      this.albums = [];
      console.log("All albums deleted");
      return new Notice(`{{"type":"delete_all_albums","content":null }}`);
    } catch (error) {
      console.debug("Error deleting all albums", error);
      return new Error_out("Failed to delete all albums");
    }
  }

  getAlbumById({ id }: { id: number }) {
    return this.albums.find((user) => user.id === id);
  }
}

export { AlbumController };
