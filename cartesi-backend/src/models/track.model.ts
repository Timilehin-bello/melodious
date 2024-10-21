import { Album } from "./album.model";
import { Artist } from "./artist.model";
import { Playlist } from "./playlist.model";

class Track {
  static nextId = 0;
  id: number;
  title: string;
  imageUrl: string;
  audioUrl: string;
  lyrics?: string | null;
  isrcCode: string;
  genreId: string;
  album: Album;
  albumId: number;
  artist: Artist;
  artistId: number;
  duration: number;
  trackNumber: number;
  playLists: Playlist[];
  createdAt: Date;
  updatedAt: Date;
  constructor(
    title: string,
    imageUrl: string,
    audioUrl: string,
    genreId: string,
    isrcCode: string,
    album: Album,
    albumId: number,
    artist: Artist,
    artistId: number,
    duration: number,
    trackNumber: number,
    lyrics?: string
  ) {
    this.id = Track.nextId++;
    this.title = title;
    this.imageUrl = imageUrl;
    this.audioUrl = audioUrl;
    this.genreId = genreId;
    this.lyrics = lyrics || null;
    this.isrcCode = isrcCode;
    this.album = album;
    this.albumId = albumId;
    this.artist = artist;
    this.artistId = artistId;
    this.duration = duration;
    this.playLists = []; // TODO: implement playlist relation using a join table or an array of playlist IDs.  // 1 track can belong to many playlists, 1 playlist can contain many tracks.  // We use an array for simplicity.  // If you want to use a join table, you can create a "Playlists_tracks" table with columns "track_id" and "playlist_id".
    this.trackNumber = trackNumber;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export { Track };
