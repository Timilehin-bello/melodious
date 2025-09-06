import { PrismaClient } from "@prisma/client";
import * as process from "process";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing subscription plans
  await prisma.subscriptionPlan.deleteMany({});
  console.log("🗑️  Cleared existing subscription plans");

  // Create subscription plans
  const subscriptionPlans = [
    {
      name: "BASIC",
      displayName: "Basic Plan",
      description: "Essential features for music lovers",
      price: 0,
      currency: "CTSI",
      duration: 30,
      features: JSON.stringify([
        "Access to limited music library",
        "Ad-supported listening",
        "Standard audio quality",
        "Basic playlist creation",
      ]),
      isActive: true,
    },
    {
      name: "PREMIUM",
      displayName: "Premium Plan",
      description: "Full access to all premium features",
      price: 100,
      currency: "CTSI",
      duration: 30, // 30 days
      features: JSON.stringify([
        "Ad-free listening",
        "Access to full music library",
        "High-fidelity audio (320kbps)",
        "Offline downloads",
        "Unlimited playlist creation",
        "Enhanced artist support",
        "Priority customer support",
        "Exclusive content access",
      ]),
      isActive: true,
    },
  ];

  // Insert subscription plans
  for (const plan of subscriptionPlans) {
    const createdPlan = await prisma.subscriptionPlan.create({
      data: plan,
    });
    console.log(
      `✅ Created subscription plan: ${createdPlan.displayName} (${createdPlan.name})`
    );
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   • Created ${subscriptionPlans.length} subscription plans`);
  console.log("   • Currency: CTSI");
  console.log("   • Plans: Basic (Free), Premium (100 CTSI/month)");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default main;
