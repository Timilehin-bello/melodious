import { ethers } from "hardhat";
import "dotenv/config";

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Signer:", signer.address);

  const tokenAddress = getArg("ctsi") || process.env.CTSI_TOKEN_ADDRESS;
  const to = getArg("to") || process.env.MINT_TO;
  const amountStr = getArg("amount") || process.env.MINT_AMOUNT;

  if (!tokenAddress) throw new Error("Missing CTSI token address (--ctsi or CTSI_TOKEN_ADDRESS)");
  if (!to) throw new Error("Missing recipient address (--to or MINT_TO)");
  if (!amountStr) throw new Error("Missing amount (--amount or MINT_AMOUNT)");
  if (!ethers.isAddress(tokenAddress)) throw new Error("Invalid CTSI token address");
  if (!ethers.isAddress(to)) throw new Error("Invalid recipient address");

  // CartesiToken uses OZ ERC20 defaults, decimals = 18
  const amount = ethers.parseUnits(amountStr, 18);

  const ctsi = await ethers.getContractAt("CartesiToken", tokenAddress);
  console.log(`Minting ${amountStr} CTSI (18 decimals) to ${to}...`);
  const tx = await ctsi.mint(to, amount);
  const receipt = await tx.wait();
  console.log("Mint tx hash:", receipt?.hash);

  const bal = await ctsi.balanceOf(to);
  console.log("Recipient CTSI balance:", bal.toString());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});