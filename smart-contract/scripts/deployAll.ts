import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const inputBoxAddress = process.env.INPUT_BOX_ADDRESS;
  const dappAddress = process.env.DAPP_ADDRESS;
  const subPriceEnv = process.env.SUBSCRIPTION_PRICE;

  if (!inputBoxAddress || inputBoxAddress === "") {
    throw new Error(
      "Missing INPUT_BOX_ADDRESS in env. Set it to the Cartesi InputBox address."
    );
  }
  if (!dappAddress || dappAddress === "") {
    throw new Error(
      "Missing DAPP_ADDRESS in env. Set it to your Cartesi DApp address."
    );
  }

  const subscriptionPrice = subPriceEnv
    ? ethers.parseUnits(subPriceEnv, 18)
    : ethers.parseUnits("100", 18); // default: 10 CTSI

  // 1) Deploy CTSI ERC20 (CartesiToken)
  const CartesiToken = await ethers.getContractFactory("CartesiToken");
  const ctsi = await CartesiToken.deploy();
  await ctsi.waitForDeployment();
  console.log("CartesiToken deployed:", ctsi.target);

  // 2) Deploy MelodiousVault
  const MelodiousVault = await ethers.getContractFactory("MelodiousVault");
  const vault = await MelodiousVault.deploy(
    ctsi.target,
    dappAddress,
    inputBoxAddress,
    dappAddress,
    subscriptionPrice
  );
  await vault.waitForDeployment();
  console.log("MelodiousVault deployed:", vault.target);

  // 2b) Mint initial CTSI supply to the MelodiousVault
  // Mint 10,000,000 CTSI (18 decimals) to the vault for operations
  const initialMintAmount = ethers.parseUnits("10000000", 18);
  console.log("Minting 10,000,000 CTSI to MelodiousVault...");
  const mintTx = await ctsi.mint(vault.target, initialMintAmount);
  await mintTx.wait();
  const vaultBalance = await ctsi.balanceOf(vault.target);
  console.log(
    "CTSI minted to vault. Current Vault CTSI balance:",
    vaultBalance.toString()
  );

  // 3) Deploy TrackNFT
  const TrackNFT = await ethers.getContractFactory("TrackNFT");
  const trackNft = await TrackNFT.deploy(
    deployer.address,
    inputBoxAddress,
    dappAddress
  );
  await trackNft.waitForDeployment();
  console.log("TrackNFT deployed:", trackNft.target);

  // 4) Deploy ArtistToken
  const ArtistToken = await ethers.getContractFactory("ArtistToken");
  const artistToken = await ArtistToken.deploy(
    deployer.address,
    deployer.address,
    ctsi.target,
    inputBoxAddress,
    dappAddress
  );

  await artistToken.waitForDeployment();
  console.log("ArtistToken deployed:", artistToken.target);
  console.log("\nDeployment complete.");
  // console.log("CTSI:", ctsi.target);
  // console.log("Vault:", vault.target);
  // console.log("TrackNFT:", trackNft.target);
  // console.log("ArtistToken:", artistToken.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
