// Test script to verify backend connection and repository notices
const testBackendConnection = async () => {
  console.log("🔍 Testing Cartesi backend connection...");

  try {
    // Test GraphQL endpoint
    const graphqlResponse = await fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            notices {
              edges {
                node {
                  index
                  input {
                    index
                  }
                  payload
                }
              }
            }
          }
        `,
      }),
    });

    const graphqlData = await graphqlResponse.json();
    console.log("✅ GraphQL Response:", graphqlData);

    // Test inspect endpoint
    const inspectResponse = await fetch("http://localhost:8080/inspect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: Buffer.from(
          JSON.stringify({
            method: "get_repository_data",
          })
        ).toString("hex"),
      }),
    });

    const inspectData = await inspectResponse.json();
    console.log("✅ Inspect Response:", inspectData);

    // Create a test user to trigger repository notice
    console.log("🧪 Creating test user to trigger repository notice...");
    const createUserPayload = {
      method: "create_user",
      data: {
        name: `Test User ${Date.now()}`,
        role: "LISTENER",
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      },
    };

    const createUserResponse = await fetch("http://localhost:8080/inspect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: Buffer.from(JSON.stringify(createUserPayload)).toString("hex"),
      }),
    });

    const createUserData = await createUserResponse.json();
    console.log("✅ Create User Response:", createUserData);

    // Wait a moment then check for new notices
    setTimeout(async () => {
      console.log("🔄 Checking for new repository notices...");
      const newNoticesResponse = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              notices(last: 5) {
                edges {
                  node {
                    index
                    input {
                      index
                    }
                    payload
                  }
                }
              }
            }
          `,
        }),
      });

      const newNoticesData = await newNoticesResponse.json();
      console.log("🔔 Latest Notices:", newNoticesData);

      // Decode payloads to see repository notices
      if (newNoticesData.data?.notices?.edges) {
        newNoticesData.data.notices.edges.forEach((edge, index) => {
          try {
            const payload = Buffer.from(
              edge.node.payload.slice(2),
              "hex"
            ).toString("utf8");
            const parsedPayload = JSON.parse(payload);
            console.log(`📋 Notice ${index + 1}:`, parsedPayload);
          } catch (e) {
            console.log(`📋 Notice ${index + 1} (raw):`, edge.node.payload);
          }
        });
      }
    }, 2000);
  } catch (error) {
    console.error("❌ Backend connection test failed:", error);
  }
};

// Export for browser console use
if (typeof window !== "undefined") {
  window.testBackendConnection = testBackendConnection;
  console.log(
    "🚀 Backend connection test loaded! Run: testBackendConnection()"
  );
}

// Run immediately if in Node.js
if (typeof window === "undefined") {
  testBackendConnection();
}

export { testBackendConnection };
