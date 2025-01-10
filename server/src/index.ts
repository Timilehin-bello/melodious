import app from "./app";
import http from "http";
import { config } from "./configs/config";
import logger from "./configs/logger";
import { rootSocket } from "./configs/rootSocket";
import { scheduleCronJobs } from ".//cronJob";
import { Server } from "socket.io";

declare global {
  var io: Server;
}

// scheduleCronJobs();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  path: "/v1/socket.io",
});

globalThis.io = io;

rootSocket(io);

server.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);
});

const exitHandler = (): void => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error): void => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", (): void => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
