import app from "./app";
import http from "http";
import { config } from "./configs/config";
import logger from "./configs/logger";
import { rootSocket } from "./configs/rootSocket";
import { scheduleCronJobs } from "./cronJob";
import { Server } from "socket.io";
import redisClient from "./configs/redisClient";
import { TrackListeningService } from "./services/trackListening.service";
import { prisma } from "./services";
import Redis from "ioredis";
import socketAuth from "./middlewares/socketAuth";

// scheduleCronJobs();
redisClient.on("connect", () => {
  logger.info(`Redis connected ${config.redis.host}:${config.redis.port}`);
  redisClient.set("try", "Hello Welcome to Redis Client");
});

redisClient.on("disconnect", () => {
  logger.info(`Redis disconnected ${config.redis.host}:${config.redis.port}`);
});

redisClient.on("error", (err) => {
  logger.error("redis error", err);
  redisClient.quit();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  path: "/v1/socket.io",
});

globalThis.io = io;
const redis = new Redis();

// Middleware to verify JWT token
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;

//   if (!token) {
//     return next(new Error('Authentication token required'));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     socket.data.user = decoded;
//     next();
//   } catch (err) {
//     next(new Error('Invalid token'));
//   }
// });
io.use(socketAuth());

new TrackListeningService(io, prisma, redis);
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
