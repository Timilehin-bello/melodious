import { Error_out } from "cartesi-wallet";

class Config {
  adminWalletAddresses: string[];
  cartesiTokenContractAddress: `0x${string}`;
  vaultContractAddress: `0x${string}`;
  vaultBalance: number;
  artistPercentage: number;
  poolPercentage: number;
  feesPercentage: number;
  serverAddress: string;
  dappContractAddress: string;
  melodiousNftAddress: string;

  constructor(
    adminWalletAddresses: string[],
    cartesiTokenContractAddress: `0x${string}`,
    vaultContractAddress: `0x${string}`,
    artistPercentage: number,
    poolPercentage: number,
    feesPercentage: number,
    serverAddress: string,
    dappContractAddress: string,
    melodiousNftAddress: string,
    vaultBalance: number = 0
  ) {
    const addressFields = [
      ...adminWalletAddresses,
      cartesiTokenContractAddress,
      serverAddress,
      dappContractAddress,
      melodiousNftAddress,
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
    this.artistPercentage = artistPercentage;
    this.poolPercentage = poolPercentage;
    this.feesPercentage = feesPercentage;
    this.serverAddress = serverAddress;
    this.dappContractAddress = dappContractAddress;
    this.melodiousNftAddress = melodiousNftAddress;
  }
}

export { Config };
