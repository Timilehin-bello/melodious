import { Album } from "./album.model";
import { Track } from "./track.model";
import { Json } from "../interfaces";

class Artist {
  static nextId = 0;
  id: number;
  userId: number;
  biography?: string | null;
  socialMediaLinks?: Json | null;
  albums: Album[];
  tracks: Track[];
  createdAt: number | Date;
  updatedAt: number | Date;

  constructor(
    userId: number,
    createdAt: number | Date,
    updatedAt: number | Date,
    biography?: string | null,
    socialMediaLinks?: Json | null
  ) {
    this.id = Artist.nextId++;
    this.userId = userId;
    this.biography = biography || null;
    this.socialMediaLinks = socialMediaLinks || null;
    this.albums = [];
    this.tracks = [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export { Artist };
