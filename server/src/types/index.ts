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
