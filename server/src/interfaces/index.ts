export interface IPayload {
  message: string;
  signature: string;
  signer: string;
}

export interface ArtistListeningStats {
  walletAddress: string;
  totalListeningTime: number;
}
