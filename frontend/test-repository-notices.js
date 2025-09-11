// Test script to create sample data and trigger repository notices
// This script will make HTTP requests to the Cartesi backend to create users, tracks, etc.

const CARTESI_BACKEND_URL = "http://localhost:8080";

// Helper function to make requests to Cartesi backend
async function sendInput(payload) {
  try {
    const response = await fetch(`${CARTESI_BACKEND_URL}/inspect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: Buffer.from(JSON.stringify(payload)).toString("hex"),
      }),
    });

    const result = await response.json();
    console.log("Response:", result);
    return result;
  } catch (error) {
    console.error("Error sending input:", error);
  }
}

// Test functions
async function createTestUser() {
  console.log("🧪 Creating test user...");
  const userPayload = {
    method: "create_user",
    data: {
      name: "Test Artist",
      role: "ARTIST",
      walletAddress: "0x1234567890123456789012345678901234567890",
    },
  };

  return await sendInput(userPayload);
}

async function createTestTrack() {
  console.log("🧪 Creating test track...");
  const trackPayload = {
    method: "create_track",
    data: {
      title: "Test Song",
      artistName: "Test Artist",
      duration: 180,
      genre: "Pop",
      walletAddress: "0x1234567890123456789012345678901234567890",
    },
  };

  return await sendInput(trackPayload);
}

async function createTestPlaylist() {
  console.log("🧪 Creating test playlist...");
  const playlistPayload = {
    method: "create_playlist",
    data: {
      title: "My Test Playlist",
      description: "A test playlist for repository notices",
      isPublic: true,
      walletAddress: "0x1234567890123456789012345678901234567890",
    },
  };

  return await sendInput(playlistPayload);
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting repository notices test...");
  console.log("This will create sample data to trigger repository notices.");
  console.log(
    "Check the frontend console and the RepositoryDataTest component for results."
  );

  try {
    await createTestUser();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

    await createTestTrack();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

    await createTestPlaylist();

    console.log(
      "✅ All test data created! Check the frontend for repository notices."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testRepositoryNotices = runTests;
  window.createTestUser = createTestUser;
  window.createTestTrack = createTestTrack;
  window.createTestPlaylist = createTestPlaylist;
  console.log("🧪 Repository notice test functions loaded!");
  console.log("Run: testRepositoryNotices() to create sample data");
}

// Run if called directly
if (typeof require !== "undefined" && require.main === module) {
  runTests();
}
