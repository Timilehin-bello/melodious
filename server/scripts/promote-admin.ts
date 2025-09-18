import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin(walletAddress: string) {
  console.log(`Promoting user with wallet ${walletAddress} to admin...`);

  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      console.error(`User with wallet address ${walletAddress} not found`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    });

    console.log(`User ${updatedUser.walletAddress} promoted to ADMIN successfully!`);
  } catch (error) {
    console.error('Error promoting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get wallet address from command line arguments
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.error('Please provide a wallet address as an argument');
  console.error('Usage: npx ts-node scripts/promote-admin.ts <wallet_address>');
  process.exit(1);
}

// Run the promotion
promoteToAdmin(walletAddress);