import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ArtistToken with account:", deployer.address);
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  // Get parameters from environment variables
  const platformWallet = process.env.DAPP_ADDRESS || deployer.address;
  const initialOwner = process.env.INITIAL_OWNER || deployer.address;
  const ctsiTokenAddress = process.env.CTSI_TOKEN_ADDRESS;
  const inputBoxAddress = process.env.INPUT_BOX_ADDRESS;
  const dappAddress = process.env.DAPP_ADDRESS;

  // Validate required parameters
  if (!ctsiTokenAddress) {
    throw new Error("CTSI_TOKEN_ADDRESS is required");
  }
  if (!inputBoxAddress) {
    throw new Error("INPUT_BOX_ADDRESS is required");
  }
  if (!dappAddress) {
    throw new Error("DAPP_ADDRESS is required");
  }

  console.log("Deployment parameters:");
  console.log("- Platform Wallet:", platformWallet);
  console.log("- Initial Owner:", initialOwner);
  console.log("- CTSI Token Address:", ctsiTokenAddress);
  console.log("- InputBox Address:", inputBoxAddress);
  console.log("- DApp Address:", dappAddress);

  // Deploy ArtistToken
  console.log("\n🚀 Deploying ArtistToken...");
  const ArtistToken = await ethers.getContractFactory("ArtistToken");
  const artistToken = await ArtistToken.deploy(
    platformWallet,
    initialOwner,
    ctsiTokenAddress,
    inputBoxAddress,
    dappAddress
  );

  await artistToken.waitForDeployment();
  const artistTokenAddress = await artistToken.getAddress();

  console.log("✅ ArtistToken deployed to:", artistTokenAddress);

  // Verify deployment by calling available functions
  console.log("\n🔍 Verifying deployment...");
  try {
    // Check if contract has code at the address
    const code = await ethers.provider.getCode(artistTokenAddress);
    if (code === "0x") {
      throw new Error("No contract code found at address");
    }

    // Test available functions
    const platformWalletAddr = await artistToken.platformWallet();
    const ctsiTokenAddr = await artistToken.ctsiToken();
    const inputBoxAddr = await artistToken.inputBox();
    const dappAddr = await artistToken.dappAddress();
    const platformFee = await artistToken.platformFeePercentage();

    console.log("✅ Contract deployed successfully!");
    console.log("✅ Platform Wallet:", platformWalletAddr);
    console.log("✅ CTSI Token:", ctsiTokenAddr);
    console.log("✅ InputBox:", inputBoxAddr);
    console.log("✅ DApp Address:", dappAddr);
    console.log("✅ Platform Fee:", platformFee.toString(), "basis points");
    console.log("✅ ArtistToken deployment verified successfully!");
  } catch (error) {
    console.log("❌ Verification failed:", error);
  }

  console.log("\n📋 Deployment Summary:");
  console.log("ArtistToken:", artistTokenAddress);
  console.log("\n💡 Add this to your .env file:");
  console.log(`ARTIST_TOKEN_ADDRESS=${artistTokenAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
