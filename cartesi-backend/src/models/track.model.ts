import { Album } from "./album.model";
import { Artist } from "./artist.model";

class Track {
  static nextId = 0;
  id: number;
  title: string;
  imageUrl: string;
  audioUrl: string;
  lyrics: string;
  isrcCode: string;
  album: Album;
  albumId: number;
  artist: Artist;
  artistId: number;
  duration: number;
  trackNumber: number;
  createdAt: Date;
  updatedAt: Date;
  constructor(
    title: string,
    imageUrl: string,
    audioUrl: string,
    lyrics: string,
    isrcCode: string,
    album: Album,
    albumId: number,
    artist: Artist,
    artistId: number,
    duration: number,
    trackNumber: number
  ) {
    this.id = Track.nextId++;
    this.title = title;
    this.imageUrl = imageUrl;
    this.audioUrl = audioUrl;
    this.lyrics = lyrics;
    this.isrcCode = isrcCode;
    this.album = album;
    this.albumId = albumId;
    this.artist = artist;
    this.artistId = artistId;
    this.duration = duration;
    this.trackNumber = trackNumber;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export { Track };
