export type Track = {
  id: number;
  title: string;
  imageUrl: string;
  audioUrl: string;
  lyrics: string | null;
  isrcCode: number | null;
  genreId: number;
  isPublished: boolean;
  albumId: number | null;
  artistId: number;
  duration: number;
  trackNumber: number | null;
  playLists: Playlist[];
  createdAt: Date;
  updatedAt: Date;
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

// export type Playlist = {};

import { BigNumber } from "ethers";
import { User } from "./hooks/useUserByWallet";
import { Playlist } from "./types/playlist";

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
  fetchData?: (user: any) => Promise<void>; // Optional since we're moving to notice-based approach
}

export type { DecodedReports, Account, InspectCallFunction, BalanceProps };
