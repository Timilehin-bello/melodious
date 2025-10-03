import { PrismaClient } from "@prisma/client";
import process from "process";

const prisma = new PrismaClient();

async function promoteToAdmin(
  walletAddress: string = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase()
) {
  console.log(`Promoting user with wallet ${walletAddress} to admin...`);

  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    // if (!user) {
    //   console.error(`User with wallet address ${walletAddress} not found`);
    //   return;
    // }

    const updatedUser = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: { role: "ADMIN" },
      create: { walletAddress: walletAddress.toLowerCase(), role: "ADMIN" },
    });

    console.log(
      `User ${updatedUser.walletAddress} promoted to ADMIN successfully!`
    );
  } catch (error) {
    console.error("Error promoting user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get wallet address from command line arguments
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.error("Please provide a wallet address as an argument");
  console.error("Usage: npx ts-node scripts/promote-admin.ts <wallet_address>");
  process.exit(1);
}

// Run the promotion
promoteToAdmin(walletAddress);
