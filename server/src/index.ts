import app from "./app";
import http from "http";
import { config } from "./configs/config";
import logger from "./configs/logger";

let server: any;

const createServer = http.createServer(app);
server = createServer.listen(config.port, () => {
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
