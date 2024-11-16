export interface Json {
  [key: string]: string;
}

export interface IDeposit {
  walletAddress: string;
  depositAmount: number;
}

export interface IListeningReward {
  walletAddress: string;
  totalListeningTime: number;
}

export interface IWithdrawal {
  walletAddress: string;
  amount: number;
}
