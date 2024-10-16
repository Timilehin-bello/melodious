import { Error_out } from "cartesi-wallet";
import { Album } from "./album.model";
import { Genre } from "./genre.model";
import { Track } from "./track.model";
import { User } from "./user.model";

export interface Json {
  [key: string]: string;
}

class Artist {
  static nextId = 0;
  id: number;
  userId: number;
  biography?: string | null;
  socialMediaLinks?: Json | null;
  // genre: string;
  albums: Album[];
  tracks: Track[];
  genres: Genre[];
  createdAt: number | Date;
  updatedAt: number | Date;

  constructor(
    userId: number,
    createdAt: number | Date,
    updatedAt: number | Date,
    biography?: string,
    socialMediaLinks?: Json
  ) {
    this.id = Artist.nextId++;
    this.userId = userId;
    this.biography = biography || null;
    this.socialMediaLinks = socialMediaLinks || null;
    // this.genre = "";
    this.genres = [];
    this.albums = [];
    this.tracks = [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

class CreateArtist {
  artists: Artist[];
  constructor() {
    this.artists = [];
  }

  create(artistBody: { user: User }) {
    if (this.getArtistByUserId(artistBody.user.id)) {
      throw new Error_out("artist with user ID already exists");
    }
    try {
      const artist = new Artist(
        artistBody.user.id,
        artistBody.user.createdAt,
        artistBody.user.updatedAt
      );
      console.log("Artist Creating Successfully");
      this.artists.push(artist);
      return artist;
    } catch (error) {
      const error_msg = `Failed to create Artist ${error}`;
      console.debug(error_msg);
      throw new Error_out(error_msg);
    }
  }

  getArtistByUserId(userId: number) {
    return this.artists.find((artist) => artist.userId === userId);
  }
}

export { Artist, CreateArtist };
