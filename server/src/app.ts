import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "./configs/morgan";
import { config } from "./configs/config";
import passport from "passport";
import routes from "./routes";
import ApiError from "./utils/ApiError";
import httpStatus from "http-status";
import { errorConverter, errorHandler } from "./middlewares/error";
import logger from "./configs/logger";
import { jwtStrategy } from "./configs/passport";

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(express.json());

// enable cors
app.use(cors());
app.options("*", cors());

app.enable("trust proxy");

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.get("/", (req: any, res: any) => {
  logger.info(`${req.ip} hit healthcheck route`);
  return res.status(httpStatus.OK).json({
    status: "success",
    message: "Welcome to Melodious Server Auth API",
  });
});

// v1 api routes
app.use("/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
