// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TrackNFTModule = buildModule("TrackNFTModule", (m) => {
  const initialOwner = m.getParameter(
    "initialOwner",
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

  return { trackNFT };
});

export default TrackNFTModule;
