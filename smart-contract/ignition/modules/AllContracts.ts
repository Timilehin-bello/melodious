// Hardhat Ignition module to deploy CartesiToken, TrackNFT, ArtistToken, and MelodiousVault
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AllContractsModule = buildModule("AllContractsModule", (m) => {
  // Parameters for external addresses and config
  const platformWallet = m.getParameter(
    "platformWallet",
    "0x88b4f6fec72dfec31d8e4827c4caf9468e847415"
  );
  const initialOwner = m.getParameter(
    "initialOwner",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  const inputBoxAddress = m.getParameter(
    "inputBoxAddress",
    "0xc70074BDD26d8cF983Ca6A5b89b8db52D5850051"
  );
  const dappAddress = m.getParameter(
    "dappAddress",
    "0x88b4f6fec72dfec31d8e4827c4caf9468e847415"
  );
  const admin = m.getParameter(
    "admin",
    "0x88b4f6fec72dfec31d8e4827c4caf9468e847415"
  );
  const subscriptionPrice = m.getParameter(
    "subscriptionPrice",
    100n * 10n ** 18n
  );

  // Deploy CTSI token first
  const ctsi = m.contract("CartesiToken");

  // TrackNFT
  const trackNFT = m.contract("TrackNFT", [
    initialOwner,
    inputBoxAddress,
    dappAddress,
  ]);

  // ArtistToken using deployed CTSI address
  const artistToken = m.contract("ArtistToken", [
    platformWallet,
    initialOwner,
    ctsi, // ignition passes address when used as a dependency
    inputBoxAddress,
    dappAddress,
  ]);

  // MelodiousVault using deployed CTSI address
  const vault = m.contract("MelodiousVault", [
    ctsi,
    admin,
    inputBoxAddress,
    dappAddress,
    subscriptionPrice,
  ]);

  return { ctsi, trackNFT, artistToken, vault };
});

export default AllContractsModule;
