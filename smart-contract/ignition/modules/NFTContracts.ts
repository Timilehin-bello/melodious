// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTContractsModule = buildModule("NFTContractsModule", (m) => {
  // Platform wallet address parameter - should be provided during deployment
  const platformWallet = m.getParameter(
    "platformWallet",
    "0x0000000000000000000000000000000000000000"
  );
  const initialOwner = m.getParameter(
    "initialOwner",
    "0x0000000000000000000000000000000000000000"
  );
  const ctsiTokenAddress = m.getParameter(
    "ctsiTokenAddress",
    "0x0000000000000000000000000000000000000000"
  );
  const inputBoxAddress = m.getParameter(
    "inputBoxAddress",
    "0x0000000000000000000000000000000000000000"
  );
  const dappAddress = m.getParameter(
    "dappAddress",
    "0x0000000000000000000000000000000000000000"
  );

  // Deploy the TrackNFT contract with Cartesi integration
  const trackNFT = m.contract("TrackNFT", [
    initialOwner,
    inputBoxAddress,
    dappAddress,
  ]);

  // Deploy the ArtistToken contract with platform wallet, initial owner, CTSI token address, and Cartesi integration
  const artistToken = m.contract("ArtistToken", [
    platformWallet,
    initialOwner,
    ctsiTokenAddress,
    inputBoxAddress,
    dappAddress,
  ]);

  return {
    trackNFT,
    artistToken,
  };
});

export default NFTContractsModule;
