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

  // Deploy the TrackNFT contract
  const trackNFT = m.contract("TrackNFT", [initialOwner]);

  // Deploy the ArtistToken contract with platform wallet, initial owner, and CTSI token address
  const artistToken = m.contract("ArtistToken", [
    platformWallet,
    initialOwner,
    ctsiTokenAddress,
  ]);

  return {
    trackNFT,
    artistToken,
  };
});

export default NFTContractsModule;
