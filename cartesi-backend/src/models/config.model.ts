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
  lastVaultBalanceDistributed: number;

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
    vaultBalance: number = 0,
    lastVaultBalanceDistributed: number = 0,
    feeBalance: number = 0
  ) {
    const addressFields = [
      ...adminWalletAddresses,
      cartesiTokenContractAddress,
      serverAddress,
      relayerAddress,
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
    this.lastVaultBalanceDistributed = lastVaultBalanceDistributed;
    this.feeBalance = feeBalance;
    this.artistPercentage = artistPercentage;
    this.poolPercentage = poolPercentage;
    this.feePercentage = feePercentage;
    this.serverAddress = serverAddress;
    this.relayerAddress = relayerAddress;
    this.dappContractAddress = dappContractAddress;
    this.melodiousNftAddress = melodiousNftAddress;
  }
}

export { Config };
