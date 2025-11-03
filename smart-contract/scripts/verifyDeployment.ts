import { ethers } from "hardhat";
import "dotenv/config";

async function verifyContract(name: string, address: string, expectedFunctions: string[]) {
  console.log(`\n🔍 Verifying ${name} at ${address}...`);
  
  try {
    // Check if code exists at address
    const code = await ethers.provider.getCode(address);
    if (code === "0x") {
      console.log(`❌ No contract deployed at ${address}`);
      return false;
    }
    console.log(`✅ Contract code found (${code.length} bytes)`);

    // Get contract instance
    const contract = await ethers.getContractAt(name, address);
    
    // Test expected functions
    for (const func of expectedFunctions) {
      try {
        const result = await contract[func]();
        console.log(`✅ ${func}(): ${result}`);
      } catch (error) {
        console.log(`❌ ${func}(): Failed - ${error}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error verifying ${name}: ${error}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Verifying Contract Deployments on Cannon Network");
  
  const contracts = [
    {
      name: "CartesiToken",
      address: process.env.CTSI_TOKEN_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      functions: ["name", "symbol", "decimals", "totalSupply"]
    },
    {
      name: "TrackNFT", 
      address: process.env.TRACK_NFT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      functions: ["name", "symbol"]
    },
    {
      name: "ArtistToken",
      address: process.env.ARTIST_TOKEN_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", 
      functions: ["name", "symbol"]
    },
    {
      name: "MelodiousVault",
      address: process.env.VAULT_ADDRESS || "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      functions: ["subscriptionPrice"]
    }
  ];

  let allVerified = true;
  
  for (const contract of contracts) {
    const verified = await verifyContract(contract.name, contract.address, contract.functions);
    allVerified = allVerified && verified;
  }
  
  console.log(`\n${allVerified ? '🎉' : '❌'} Overall Status: ${allVerified ? 'All contracts verified successfully!' : 'Some contracts failed verification'}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});