class ArtistToken {
  static nextId = 1;
  id: number;
  owner: string;
  trackId: string;
  amount: number; // This represents totalSupply for minted tokens
  totalSupply: number; // Total tokens minted
  availableSupply: number; // Tokens available for purchase
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
    this.totalSupply = amount; // Initially, total supply equals amount
    this.availableSupply = amount; // Initially, all tokens are available
    this.pricePerToken = pricePerToken;
    this.mintedAt = mintedAt;
    this.isActive = isActive;
    this.tokenId = tokenId;
  }
}

export { ArtistToken };
