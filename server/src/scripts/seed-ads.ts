import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleAds = [
  {
    title: "Premium Music Experience",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    duration: 15,
    isActive: true,
  },
  {
    title: "Discover New Artists",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop&crop=center",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    duration: 20,
    isActive: true,
  },
  {
    title: "Upgrade to Pro",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop&crop=center",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    duration: 30,
    isActive: true,
  },
];

async function seedAds() {
  console.log('Seeding ads...');

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

    console.log('Ads seeded successfully!');
  } catch (error) {
    console.error('Error seeding ads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAds();