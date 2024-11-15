import { Error_out, Log, Notice } from "cartesi-wallet";
import { Track, User } from "../models";
import { GenreController, UserController } from "./";
import { UserType } from "../configs/enum";
import { RepositoryService } from "../services";

class TrackController {
  public createTrack(
    trackBody: Track & { walletAddress: string },
    returnAsNotice?: boolean
  ) {
    if (
      !trackBody.title ||
      !trackBody.audioUrl ||
      !trackBody.imageUrl ||
      !trackBody.duration ||
      !trackBody.isrcCode ||
      !trackBody.isPublished
    )
      return new Error_out("Missing required fields");

    const genre = new GenreController().getGenreById(trackBody.genreId);

    if (trackBody.genreId && !genre) {
      return new Error_out("Genre with id does not exist");
    }

    const findUser: User | undefined =
      new UserController().getUserByUniqueValue({
        key: "walletAddress",
        value: trackBody.walletAddress.toLowerCase(),
      });

    if (!findUser) {
      return new Error_out("User with wallet address does not exist");
    }

    if (findUser.role !== UserType.ARTIST || !findUser.artist) {
      return new Error_out("Only artist can create tracks");
    }
    try {
      const newTrack = new Track(
        trackBody.title,
        trackBody.imageUrl,
        trackBody.audioUrl,
        trackBody.genreId,
        trackBody.albumId || null,
        findUser.artist.id,
        trackBody.duration,
        trackBody.isPublished,
        trackBody.createdAt,
        trackBody.updatedAt,
        trackBody.trackNumber || null,
        trackBody.isrcCode || null,
        trackBody.lyrics || null
      );
      if (!newTrack) {
        return new Error_out("Failed to create track");
      }

      RepositoryService.tracks.push(newTrack);

      console.log("Track created", newTrack);
      const track_json = JSON.stringify(newTrack);
      if (!returnAsNotice) {
        console.log(
          "All  tracks",
          RepositoryService.tracks,
          RepositoryService.tracks.length
        );
        console.log("Creating track", track_json);
        return newTrack;
      }
      const notice_payload = `{{"type":"create_track", "content":${track_json} }}`;
      return new Notice(notice_payload);
    } catch (error) {
      const error_msg = `Failed to create Track ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  public updateTrack(
    trackBody: Track & { walletAddress: string },
    returnAsNotice?: boolean
  ) {
    if (!trackBody.id) return new Error_out("Missing required fields");

    const genre = new GenreController().getGenreById(trackBody.genreId);

    if (trackBody.genreId && !genre) {
      return new Error_out("Genre with id does not exist");
    }

    const findTrackToUpdate = this.getTrackById({ id: trackBody.id });
    if (!findTrackToUpdate) {
      return new Error_out("Track with id does not exist");
    }

    const findUser: User | undefined =
      new UserController().getUserByUniqueValue({
        key: "walletAddress",
        value: trackBody.walletAddress.toLowerCase(),
      });

    if (!findUser) {
      return new Error_out("User with wallet address does not exist");
    }

    if (findUser.role !== UserType.ARTIST || !findUser.artist) {
      return new Error_out("Only artists can update tracks");
    }

    if (findUser.artist?.id !== findTrackToUpdate.artistId) {
      return new Error_out(
        "Not authorized to update this album. Only the creator of the track can update it"
      );
    }

    try {
      const { walletAddress, createdAt, ...rest } = trackBody;
      Object.assign(findTrackToUpdate, {
        ...rest,
      });

      //  RepositoryService.tracks = RepositoryService.tracks.map((track) =>
      //    track.id === findTrackToUpdate.id ? findTrackToUpdate : track
      //  );

      const track_json = JSON.stringify(findTrackToUpdate);
      if (!returnAsNotice) {
        console.log("Updating track", track_json);
        return findTrackToUpdate;
      }

      console.log("Updating track", track_json);
      const notice_payload = `{{"type":"update_track", "content":${track_json} }}`;
      return new Notice(notice_payload);
    } catch (error) {
      console.debug("Error updating track", error);
      return new Error_out("Failed to update track");
    }
  }

  public getTrack(trackId: number) {
    try {
      const track_json = JSON.stringify(this.getTrackById({ id: trackId }));
      console.log("track", track_json);
      return new Log(track_json);
    } catch (error) {
      const error_msg = `Failed to get track ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  public getTracks() {
    try {
      const tracks_json = JSON.stringify(RepositoryService.tracks);
      console.log("tracks", tracks_json);
      return new Log(tracks_json);
    } catch (error) {
      const error_msg = `Failed to get tracks ${error}`;
      console.debug(error_msg);
      return new Error_out(error_msg);
    }
  }

  public deleteTrack(trackId: number) {
    try {
      const track = this.getTrackById({ id: trackId });
      if (!track) {
        return new Error_out("Track with id does not exist");
      }
      RepositoryService.tracks = RepositoryService.tracks.filter(
        (track) => track.id !== trackId
      );
      console.log("Track deleted", track);
      return new Notice(
        `{{"type":"delete_track","content":${JSON.stringify(track)} }}`
      );
    } catch (error) {
      console.debug("Error deleting track", error);
      return new Error_out("Failed to delete track");
    }
  }

  public deleteTracks() {
    try {
      RepositoryService.tracks = [];
      console.log("All tracks deleted");
      return new Notice(`{{"type":"delete_all_tracks","content":null }}`);
    } catch (error) {
      console.debug("Error deleting all tracks", error);
      return new Error_out("Failed to delete all tracks");
    }
  }

  public getTrackById({ id }: { id: number }) {
    return RepositoryService.tracks.find((track) => track.id === id);
  }

  public getAllTracks() {
    return RepositoryService.tracks;
  }
}

export { TrackController };
