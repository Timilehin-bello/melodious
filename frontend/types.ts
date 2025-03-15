export type Track = {
  id: number;
  title: string;
  duration?: any;
  genreId?: number;
  imageUrl: string;
  audioUrl: string;
  isrcCode?: string;
  isPublished?: string;
  artist?: string;
};

export type Albums = {
  title: string;
  imageUrl: string;
  genreId: number;
  label: string;
  isPublished: boolean;
  tracks: Array<{
    title: string;
    imageUrl: string;
    genreId: number;
    audioUrl: string;
    isrcCode: number;
    duration: number;
    isPublished: boolean;
  }>;
};

export type Playlist = {};

import { BigNumber } from "ethers";

// Interface for the decoded balance report
interface DecodedReports {
  ether?: BigNumber; // Ether balance in Wei (BigNumber for precision)
  erc20?: string; // ERC-20 format: "TOKEN_NAME,AMOUNT"
  erc721?: string; // ERC-721 format: "COLLECTION_NAME,TOKEN_ID"
}

// Interface for the user's Ethereum account
interface Account {
  address: string;
}

// Type for the function that fetches balance data
type InspectCallFunction = (url: string) => Promise<void> | void;

// Props interface for the BalanceTable component
interface BalanceProps {
  reports: string[];
  decodedReports: DecodedReports;
  ethers?: typeof import("ethers");
  account: Account | null;
  inspectCall: InspectCallFunction;
  transactionStatus: boolean; // Indicates if a transaction has occurred
  userDetails: any;
  fetchData: (user: any) => Promise<void>;
}

export type { DecodedReports, Account, InspectCallFunction, BalanceProps };
