import { Album } from "./album.model";
import { Track } from "./track.model";

class Genre {
  static nextId = 1;
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  tracks: Track[];
  albums: Album[];
  createdAt: Date;
  updatedAt: Date;
  constructor(
    name: string,
    imageUrl: string,
    description: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = Genre.nextId++;
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.tracks = [];
    this.albums = [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export { Genre };
