// utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      path: process.env.NEXT_PUBLIC_SOCKET_PATH, // Example: /v1/socket.io
      //   addTrailingSlash: false,
      auth: {
        token: token, // Or use dynamic token fetching
      },
      //   transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection success handler
    socket.on("connect", () => {
      console.log("Successfully connected with authentication!");
    });

    // Connection error handler
    socket.on("connect_error", (error) => {
      console.log("Connection error:", error.message);
    });

    // Handle authentication errors (custom server-side events)
    socket.on("unauthorized", (error) => {
      console.log("Authentication failed:", error);
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.warn("Disconnected:", reason);
    });
  }

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};
