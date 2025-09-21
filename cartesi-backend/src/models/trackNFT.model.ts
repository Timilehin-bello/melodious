class TrackNFT {
  static nextId = 1;
  id: number;
  owner: string;
  trackId: string;
  ipfsHash: string;
  royaltyPercentage: number;
  mintedAt: number;
  isActive: boolean;
  tokenId?: number;

  constructor(
    owner: string,
    trackId: string,
    ipfsHash: string,
    royaltyPercentage: number,
    mintedAt: number,
    isActive: boolean = true,
    tokenId?: number
  ) {
    this.id = TrackNFT.nextId++;
    this.owner = owner;
    this.trackId = trackId;
    this.ipfsHash = ipfsHash;
    this.royaltyPercentage = royaltyPercentage;
    this.mintedAt = mintedAt;
    this.isActive = isActive;
    this.tokenId = tokenId;
  }
}

export { TrackNFT };
