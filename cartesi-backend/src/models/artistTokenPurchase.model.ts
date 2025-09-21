class ArtistTokenPurchase {
  static nextId = 1;
  id: number;
  buyer: string;
  trackId: string;
  amount: number;
  totalPrice: number;
  purchasedAt: number;
  transactionHash?: string;

  constructor(
    buyer: string,
    trackId: string,
    amount: number,
    totalPrice: number,
    purchasedAt: number,
    transactionHash?: string
  ) {
    this.id = ArtistTokenPurchase.nextId++;
    this.buyer = buyer;
    this.trackId = trackId;
    this.amount = amount;
    this.totalPrice = totalPrice;
    this.purchasedAt = purchasedAt;
    this.transactionHash = transactionHash;
  }
}

export { ArtistTokenPurchase };
