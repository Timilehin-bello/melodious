import { io, Socket } from "socket.io-client";

let socket: Socket;

interface SocketConfig {
  serverUrl?: string;
  authToken?: string;
}

export const initSocket = ({
  serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
    "http://localhost:8088",
  authToken,
}: SocketConfig) => {
  if (!authToken) {
    throw new Error("Authentication token is required");
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(serverUrl, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token: authToken,
    },
    // Alternatively, you can use extraHeaders if your server expects token in headers
    extraHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  socket.on("connect", () => {
    console.log("Socket connected!", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    // Handle authentication errors specifically
    if (error.message === "Invalid token") {
      console.error("Invalid authentication token");
      // You might want to trigger a logout or token refresh here
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// Utility function to update auth token (useful after token refresh)
export const updateAuthToken = (newToken: string) => {
  if (socket) {
    socket.auth = { token: newToken };
    // Reconnect with new token
    socket.disconnect().connect();
  }
};
