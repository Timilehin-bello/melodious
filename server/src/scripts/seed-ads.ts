import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleAds = [
  {
    title: "Premium Music Experience",
    imageUrl:
      "https://chocolate-actual-weasel-471.mypinata.cloud/ipfs/QmNqi4VCA7nE3bFsfmcrKJoM4vi8t22r46xkBYWrAyNekT",
    audioUrl:
      "https://chocolate-actual-weasel-471.mypinata.cloud/ipfs/QmcrrbbLBDZdES9aNszrupQCfcGsyFt3b72tnabkLt3y34",
    duration: 58,
    isActive: true,
  },
  {
    title: "Discover New Artists",
    imageUrl:
      "https://chocolate-actual-weasel-471.mypinata.cloud/ipfs/QmNqi4VCA7nE3bFsfmcrKJoM4vi8t22r46xkBYWrAyNekT",
    audioUrl:
      "https://chocolate-actual-weasel-471.mypinata.cloud/ipfs/QmcrrbbLBDZdES9aNszrupQCfcGsyFt3b72tnabkLt3y34",
    duration: 58,
    isActive: true,
  },
  {
    title: "Upgrade to Pro",
    imageUrl:
      "https://chocolate-actual-weasel-471.mypinata.cloud/ipfs/QmNqi4VCA7nE3bFsfmcrKJoM4vi8t22r46xkBYWrAyNekT",
    audioUrl:
      "https://chocolate-actual-weasel-471.mypinata.cloud/ipfs/QmcrrbbLBDZdES9aNszrupQCfcGsyFt3b72tnabkLt3y34",
    duration: 58,
    isActive: true,
  },
];

async function seedAds() {
  console.log("Seeding ads...");

  try {
    // Clear existing ads
    await prisma.adPlay.deleteMany({});
    await prisma.ad.deleteMany({});

    // Create new sample ads
    for (const adData of sampleAds) {
      const ad = await prisma.ad.create({
        data: adData,
      });
      console.log(`Created ad: ${ad.title} (ID: ${ad.id})`);
    }

    console.log("Ads seeded successfully!");
  } catch (error) {
    console.error("Error seeding ads:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAds();
