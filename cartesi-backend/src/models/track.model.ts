import { Playlist } from "./playlist.model";

class Track {
  static nextId = 1;
  id: number;
  title: string;
  imageUrl: string;
  audioUrl: string;
  lyrics: string | null;
  isrcCode: number | null;
  genreId: number;
  isPublished: boolean;
  albumId: number | null;
  artistId: number;
  duration: number;
  trackNumber: number | null;
  playLists: Playlist[];
  createdAt: Date;
  updatedAt: Date;
  constructor(
    title: string,
    imageUrl: string,
    audioUrl: string,
    genreId: number,
    albumId: number | null,
    artistId: number,
    duration: number,
    isPublished: boolean,
    createdAt: Date,
    updatedAt: Date,
    trackNumber: number | null,
    isrcCode: number | null,
    lyrics: string | null
  ) {
    this.id = Track.nextId++;
    this.title = title;
    this.imageUrl = imageUrl;
    this.audioUrl = audioUrl;
    this.genreId = genreId;
    this.lyrics = lyrics || null;
    this.isrcCode = isrcCode;
    this.albumId = albumId || null;
    this.artistId = artistId;
    this.duration = duration;
    this.isPublished = isPublished;
    this.playLists = [];
    this.trackNumber = trackNumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export { Track };
