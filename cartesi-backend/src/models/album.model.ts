import { Track } from "./track.model";

class Album {
  static nextId = 1;
  id: number;
  title: string;
  artistId: number;
  releaseDate: Date;
  imageUrl: string;
  isPublished: boolean;
  totalTracks: number;
  label: string;
  genreId: number;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
  constructor(
    title: string,
    artistId: number,
    releaseDate: Date,
    imageUrl: string,
    totalTracks: number,
    label: string,
    genreId: number,
    isPublished: boolean,
    createdAt: Date,
    updatedAt: Date,
    tracks: Track[] = []
  ) {
    this.id = Album.nextId++;
    this.title = title;
    this.releaseDate = new Date();
    this.artistId = artistId;
    this.releaseDate = releaseDate;
    this.imageUrl = imageUrl;
    this.totalTracks = totalTracks;
    this.label = label;
    this.genreId = genreId;
    this.isPublished = isPublished;
    this.tracks = tracks || [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export { Album };
