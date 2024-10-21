import { create } from "domain";
import { Track } from "./track.model";

class Playlist {
  static nextId = 0;
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  public: boolean;
  listenerId: number;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    title: string,
    imageUrl: string,
    description: string,
    listenerId: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = Playlist.nextId++;
    this.public = true;
    this.title = title;
    this.listenerId = listenerId;
    this.imageUrl = imageUrl;
    this.description = description;
    this.tracks = [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export { Playlist };
