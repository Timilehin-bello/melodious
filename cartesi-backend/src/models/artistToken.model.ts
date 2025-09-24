class ArtistToken {
  static nextId = 1;
  id: number;
  owner: string;
  trackId: string;
  amount: number;
  pricePerToken: number;
  mintedAt: number;
  isActive: boolean;
  tokenId?: number;

  constructor(
    owner: string,
    trackId: string,
    amount: number,
    pricePerToken: number,
    mintedAt: number,
    isActive: boolean = true,
    tokenId?: number
  ) {
    this.id = ArtistToken.nextId++;
    this.owner = owner;
    this.trackId = trackId;
    this.amount = amount;
    this.pricePerToken = pricePerToken;
    this.mintedAt = mintedAt;
    this.isActive = isActive;
    this.tokenId = tokenId;
  }
}

export { ArtistToken };
