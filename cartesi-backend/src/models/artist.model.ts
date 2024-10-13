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
  user: User;
  userId: number;
  biography: string;
  socialMediaLinks?: Json;
  // genre: string;
  albums: Album[];
  tracks: Track[];
  genres: Genre[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    user: User,
    userId: number,
    biography: string,
    socialMediaLinks?: Json
  ) {
    this.id = Artist.nextId++;
    this.user = user;
    this.userId = userId;
    this.biography = biography;
    this.socialMediaLinks = socialMediaLinks;
    // this.genre = "";
    this.genres = [];
    this.albums = [];
    this.tracks = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export { Artist };
