import winston, { Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "./config";

const enumerateErrorFormat = winston.format((info: any) => {
  if (info.message instanceof Error) {
    info.message = {
      message: info.message.message,
      stack: info.message.stack,
      ...info.message,
    };
  }

  if (info instanceof Error) {
    return {
      // message: info.message,
      stack: info.stack,
      ...info,
    };
  }

  return info;
});

const transport = new DailyRotateFile({
  filename: config.logConfig.logFolder + config.logConfig.logFile,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "3",
  // prepend: true,
});

const logger: Logger = winston.createLogger({
  level: config.env === "development" ? "debug" : "info",
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    transport,
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

export default logger;
