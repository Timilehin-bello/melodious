export interface IPayload {
  message: string;
  signature: string;
  signer: string;
}

export interface ArtistListeningStats {
  walletAddress: string;
  totalListeningTime: number;
}

export interface IMethodHandlers {
  [key: string]: (
    cleanedPayload: any,
    tx: { data: string; signer: string }
  ) => Promise<any>;
}

export interface ITransactionPayload {
  method: string;
  args: any;
}

export interface ITransaction {
  data: string;
  signer: string;
}
