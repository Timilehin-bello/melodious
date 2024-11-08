import { Error_out } from "cartesi-wallet";
import { Json } from "../interfaces";
import { Artist } from "../models/";
import { User } from "../models/user.model";
import { Repository } from "../services";

class ArtistController {
  createArtist(artistBody: {
    user: User;
    biography?: string | null;
    socialMediaLinks?: Json | null;
  }) {
    if (this.getArtistByUserId(artistBody.user.id)) {
      throw new Error_out("artist with user ID already exists");
    }
    try {
      const artist = new Artist(
        artistBody.user.id,
        artistBody.user.createdAt,
        artistBody.user.updatedAt,
        artistBody.biography,
        artistBody.socialMediaLinks
      );
      console.log("Artist Creating Successfully");
      Repository.artists.push(artist);
      return artist;
    } catch (error) {
      const error_msg = `Failed to create Artist ${error}`;
      console.debug(error_msg);
      throw new Error_out(error_msg);
    }
  }

  updateArtist(userId: number, timestamp: number, artistBody: Partial<Artist>) {
    try {
      const updateArtist = this.getArtistByUserId(userId);
      if (!updateArtist) {
        throw new Error_out("Artist not found");
      }
      // const {id,  ...rest } = updateArtist
      artistBody.updatedAt = timestamp;
      Object.assign(updateArtist, artistBody);
      console.log("Artist Updating Successfully");
      return updateArtist;
    } catch (error) {
      const error_msg = `Failed to update Artist ${error}`;
      console.debug(error_msg);
      throw new Error_out(error_msg);
    }
  }

  getArtistByUserId(userId: number) {
    return Repository.artists.find((artist) => artist.userId === userId);
  }
}

export { ArtistController };
