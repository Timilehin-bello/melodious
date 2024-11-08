import { Error_out, Log, Notice } from "cartesi-wallet";
import { Album, Track, User } from "../models";
import { UserController } from "./user.controller";
import { UserType } from "../configs/enum";
import { TrackController } from "./track.controller";
import { GenreController } from "./genre.controller";
import { Repository } from "../services";

class AlbumController {
  createAlbum(albumBody: Album & { walletAddress: string }) {
    console.log("albumBody", albumBody);

    if (
      !albumBody.title ||
      !albumBody.imageUrl ||
      !albumBody.label ||
      !albumBody.isPublished ||
      !albumBody.tracks ||
      albumBody.tracks.length === 0
    ) {
      return new Error_out("Missing required fields");
    }

    const findUser: User | undefined =
      new UserController().getUserByUniqueValue({
        key: "walletAddress",
        value: albumBody.walletAddress.toLowerCase(),
      });

    if (!findUser) {
      return new Error_out("User with wallet address does not exist");
    }

    if (findUser.role !== UserType.ARTIST || !findUser.artist) {
      return new Error_out("Only artists can update albums");
    }

    const genre = new GenreController().getGenreById(albumBody.genreId);

    if (!genre) {
      return new Error_out("Genre with id does not exist");
    }

    try {
      const newAlbum = new Album(
        albumBody.title,
        findUser.artist.id,
        albumBody.releaseDate,
        albumBody.imageUrl,
        albumBody.tracks.length,
        albumBody.label,
        genre.id,
        albumBody.isPublished,
        albumBody.createdAt,
        albumBody.updatedAt
      );

      const createdTracks = albumBody.tracks.map((track) => {
        if (!findUser.artist) {
          return new Error_out("Only artists can create tracks");
        }
        return new TrackController().createTrack({
          ...track,
          walletAddress: albumBody.walletAddress,
          genreId: track.genreId,
          createdAt: albumBody.createdAt,
          updatedAt: albumBody.updatedAt,
          albumId: newAlbum.id,
          artistId: findUser.artist.id,
          lyrics: track.lyrics || null,
        });
      });

      const errorTracks = createdTracks.filter(
        (track) => track instanceof Error_out
      ) as Error_out[];

      if (errorTracks.length > 0) {
        console.debug("Error creating tracks", errorTracks);
        return errorTracks[0];
      }

      if (!newAlbum || !createdTracks || createdTracks.length === 0) {
        return new Error_out("Failed to create album");
      }

      newAlbum.tracks = createdTracks.filter(
        (track) => track instanceof Track
      ) as Track[];

      console.log("Album created", newAlbum);

      Repository.albums.push(newAlbum);

      const album_json = JSON.stringify(Repository.albums);
      const notice_payload = `{{"type":"create_album","content:${album_json} }}`;
      return new Notice(notice_payload);
    } catch (error) {
      const error_msg = `Failed to create album ${error}`;
      console.debug("Create Album", error_msg);
      return new Error_out(error_msg);
    }
  }

  updateAlbum(albumBody: Album & { walletAddress: string }) {
    console.log("albumBody", albumBody);
    if (!albumBody.id) {
      return new Error_out("Missing required field");
    }

    const genre = new GenreController().getGenreById(albumBody.genreId);

    if (albumBody.genreId && !genre) {
      return new Error_out("Genre with id does not exist");
    }

    const findAlbumToUpdate = this.getAlbumById({ id: albumBody.id });
    if (!findAlbumToUpdate) {
      return new Error_out(`Album with id ${albumBody.id} not found`);
    }

    const findUser: User | undefined =
      new UserController().getUserByUniqueValue({
        key: "walletAddress",
        value: albumBody.walletAddress.toLowerCase(),
      });

    if (!findUser) {
      return new Error_out("User with wallet address does not exist");
    }

    if (findUser.role !== UserType.ARTIST || !findUser.artist) {
      return new Error_out("Only artists can update albums");
    }

    if (findUser.artist.id !== findAlbumToUpdate.artistId) {
      return new Error_out(
        "Not authorized to update this album. Only the creator of the album can update it"
      );
    }

    try {
      const {
        artistId,
        releaseDate,
        createdAt,
        walletAddress,
        tracks,
        ...rest
      } = albumBody;

      if (tracks.length > 0 && tracks) {
        const updatedTrack = tracks.map((track) =>
          new TrackController().updateTrack({
            walletAddress,
            ...track,
          })
        );
        findAlbumToUpdate.tracks = updatedTrack.filter(
          (track) => track instanceof Track
        ) as Track[];
      }

      Object.assign(findAlbumToUpdate, {
        ...rest,
      });

      const album_json = JSON.stringify(findAlbumToUpdate);

      console.log("Updating album", album_json);

      const notice_payload = `{{"type":"update_album","content:${album_json} }}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error updating album", error);
      return new Error_out(`Failed to update album with id ${albumBody.id}`);
    }
  }

  public getAlbums() {
    try {
      const albums_json = JSON.stringify(Repository.albums);
      console.log("albums", albums_json);
      return new Log(albums_json);
    } catch (error) {
      const error_msg = `Failed to get albums ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  public getAlbum(album_id: number) {
    try {
      let album_json = JSON.stringify(Repository.albums[album_id]);
      console.log("Album", album_json);
      return new Log(album_json);
    } catch (error) {
      return new Error_out(`Album with id ${album_id} not found`);
    }
  }

  public deleteAlbum(album_id: number) {
    try {
      const album = this.getAlbumById({ id: album_id });
      if (!album) {
        return new Error_out(`Album with id ${album_id} not found`);
      }

      Repository.albums = Repository.albums.filter((u) => u.id !== album_id);

      console.log("Album deleted", album);

      const album_json = JSON.stringify(album);
      console.log("Deleting album", album_json);

      const notice_payload = `{{"type":"delete_album","content":${album_json} }}`;

      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error deleting album", error);
      return new Error_out(`Failed to delete album with id ${album_id}`);
    }
  }

  public deleteAlbums() {
    try {
      Repository.albums = [];
      console.log("All albums deleted");
      return new Notice(`{{"type":"delete_all_albums","content":null }}`);
    } catch (error) {
      console.debug("Error deleting all albums", error);
      return new Error_out("Failed to delete all albums");
    }
  }

  public getAlbumById({ id }: { id: number }) {
    return Repository.albums.find((album) => album.id === id);
  }
}

export { AlbumController };
