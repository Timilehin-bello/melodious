import { Track } from "./track.model";

class Playlist {
  static nextId = 1;
  id: number;
  title: string;
  imageUrl: string | null;
  description: string | null;
  public: boolean;
  listenerId: number;
  walletAddress: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    title: string,
    imageUrl: string | null,
    description: string | null,
    listenerId: number,
    walletAddress: string,
    createdAt: Date,
    updatedAt: Date,
    isPublic: boolean = true
  ) {
    this.id = Playlist.nextId++;
    this.public = isPublic;
    this.title = title;
    this.listenerId = listenerId;
    this.walletAddress = walletAddress;
    this.imageUrl = imageUrl || null;
    this.description = description;
    this.tracks = [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Method to add tracks to playlist
  addTrack(track: Track, timestamp?: number): void {
    this.tracks.push(track);
    this.updatedAt = timestamp ? new Date(timestamp * 1000) : new Date();
  }

  // Method to remove track from playlist
  removeTrack(trackId: number, timestamp?: number): void {
    this.tracks = this.tracks.filter((track) => track.id !== trackId);
    this.updatedAt = timestamp ? new Date(timestamp * 1000) : new Date();
  }

  // Method to validate IPFS URL format
  static isValidIPFSUrl(url: string): boolean {
    return url.includes("/ipfs/") || url.startsWith("ipfs://");
  }
}

export { Playlist };
