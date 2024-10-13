import { Album } from "./album.model";
import { Artist } from "./artist.model";
import { Track } from "./track.model";

class Genre {
  static nextId = 0;
  id: number;
  name: string;
  imageUrl: string;
  tracks: Track[];
  artists: Artist[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(name: string, imageUrl: string, description: string) {
    this.id = Genre.nextId++;
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.tracks = [];
    this.artists = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export { Genre };
