import morgan, { StreamOptions } from "morgan";
import { config } from "./config";
import logger from "./logger";
import { Request, Response } from "express";

morgan.token(
  "message",
  (_req: Request, res: Response) => res.locals.errorMessage || ""
);

const getIpFormat = (): string =>
  config.env === "production" ? ":remote-addr - " : "";
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (_req: Request, res: Response) => res.statusCode >= 400,
  stream: {
    write: (message: string) => logger.info(message.trim()),
  } as StreamOptions,
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (_req: Request, res: Response) => res.statusCode < 400,
  stream: {
    write: (message: string) => logger.error(message.trim()),
  } as StreamOptions,
});

export default {
  successHandler,
  errorHandler,
};
