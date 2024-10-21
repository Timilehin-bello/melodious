import { Artist } from "./artist.model";
import { Track } from "./track.model";

class Album {
  static nextId = 0;
  id: number;
  title: string;
  artist: Artist;
  artistId: number;
  releaseDate: Date;
  coverImageUrl: string;
  totalTracks: number;
  label: string;
  genreId: number;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
  constructor(
    title: string,
    artist: Artist,
    artistId: number,
    releaseDate: Date,
    coverImageUrl: string,
    totalTracks: number,
    label: string,
    genreId: number,
    tracks: Track[]
  ) {
    this.id = Album.nextId++;
    this.title = title;
    this.releaseDate = new Date();
    this.artist = artist;
    this.artistId = artistId;
    this.releaseDate = releaseDate;
    this.coverImageUrl = coverImageUrl;
    this.totalTracks = totalTracks;
    this.label = label;
    this.genreId = genreId;
    this.tracks = tracks || [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export { Album };
