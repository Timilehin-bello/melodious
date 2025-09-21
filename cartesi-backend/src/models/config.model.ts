import { Error_out } from "cartesi-wallet";

class Config {
  adminWalletAddresses: string[];
  cartesiTokenContractAddress: `0x${string}`;
  vaultContractAddress: `0x${string}`;
  vaultBalance: number;
  feeBalance: number;
  artistPercentage: number;
  poolPercentage: number;
  feePercentage: number;
  serverAddress: string;
  relayerAddress: string;
  dappContractAddress: string;
  melodiousNftAddress: string;
  trackNftContractAddress: `0x${string}`;
  artistTokenContractAddress: `0x${string}`;
  lastVaultBalanceDistributed: number;
  referralPoints: number;
  conversionRate: number;
  minConversion: number;
  maxDailyConversion: number;

  constructor(
    adminWalletAddresses: string[],
    cartesiTokenContractAddress: `0x${string}`,
    vaultContractAddress: `0x${string}`,
    artistPercentage: number,
    poolPercentage: number,
    feePercentage: number,
    serverAddress: string,
    relayerAddress: string,
    dappContractAddress: string,
    melodiousNftAddress: string,
    trackNftContractAddress: `0x${string}`,
    artistTokenContractAddress: `0x${string}`,
    vaultBalance: number = 0,
    lastVaultBalanceDistributed: number = 0,
    feeBalance: number = 0,
    referralPoints: number = 100,
    conversionRate: number = 1000,
    minConversion: number = 1000,
    maxDailyConversion: number = 10000
  ) {
    const addressFields = [
      ...adminWalletAddresses,
      cartesiTokenContractAddress,
      vaultContractAddress,
      serverAddress,
      relayerAddress,
      dappContractAddress,
      melodiousNftAddress,
      trackNftContractAddress,
      artistTokenContractAddress,
    ];

    addressFields.forEach((address) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error_out(`Invalid wallet address: ${address}`);
      }
    });

    this.adminWalletAddresses = adminWalletAddresses;
    this.cartesiTokenContractAddress = cartesiTokenContractAddress;
    this.vaultContractAddress = vaultContractAddress;
    this.vaultBalance = vaultBalance;
    this.lastVaultBalanceDistributed = lastVaultBalanceDistributed;
    this.feeBalance = feeBalance;
    this.artistPercentage = artistPercentage;
    this.poolPercentage = poolPercentage;
    this.feePercentage = feePercentage;
    this.serverAddress = serverAddress;
    this.relayerAddress = relayerAddress;
    this.dappContractAddress = dappContractAddress;
    this.melodiousNftAddress = melodiousNftAddress;
    this.trackNftContractAddress = trackNftContractAddress;
    this.artistTokenContractAddress = artistTokenContractAddress;
    this.referralPoints = referralPoints;
    this.conversionRate = conversionRate;
    this.minConversion = minConversion;
    this.maxDailyConversion = maxDailyConversion;
  }
}

export { Config };
