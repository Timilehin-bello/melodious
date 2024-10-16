class Playlist {
  static nextId = 0;
  id: number;
  subscriptionLevel: string;
  walletAddress: string;
  username: string;

  constructor(
    subscriptionLevel: string,
    walletAddress: string,
    username: string
  ) {
    this.id = Playlist.nextId++;
    this.subscriptionLevel = subscriptionLevel || "FREE";
    this.walletAddress = walletAddress;
    this.username = username;
  }
}
