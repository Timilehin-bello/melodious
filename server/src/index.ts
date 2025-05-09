import app from "./app";
import http from "http";
import { config } from "./configs/config";
import logger from "./configs/logger";
import { rootSocket } from "./configs/rootSocket";
import { Server } from "socket.io";
import redisClient from "./configs/redisClient";
import { TrackListeningService } from "./services/trackListening.service";
import { prisma } from "./services";
import socketAuth from "./middlewares/socketAuth";
import {
  distributeRewardToArtistsBasedOnTotalTrackListens,
  updateArtistListeningTimeOnCartesi,
  runRewardUpdateCycle,
} from "./cronJob";

// scheduleCronJobs();
// updateArtistListeningTimeOnCartesi();
// distributeRewardToArtistsBasedOnTotalTrackListens();
runRewardUpdateCycle();

redisClient.on("connect", () => {
  logger.info(`Redis connected ${config.redis.host}:${config.redis.port}`);
  redisClient.set("try", "Hello Welcome to Redis Client");
});

redisClient.on("disconnect", () => {
  logger.info(`Redis disconnected ${config.redis.host}:${config.redis.port}`);
});

redisClient.on("error", (err) => {
  logger.error("redis error", err);
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `${process.env.NODE_ENV === "development" ? "http" : "https"}://${
      process.env.THIRDWEB_CLIENT_DOMAIN ?? "localhost:3000"
    }`,
    methods: ["GET", "POST"],
  },
  path: "/v1/socket.io",
});

globalThis.io = io;

io.use(socketAuth());

new TrackListeningService(io, prisma, redisClient);
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
  logger.error(" Unexpected Error", error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", (): void => {
  logger.info("SIGTERM signal received: closing HTTP server");
  exitHandler();
  // if (server) {
  //   server.close();
  // }
});
