import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

import { userService, tokenService, authService } from "../services";
import ApiError from "../utils/ApiError";
import { Prisma } from "@prisma/client";
import { VerifyLoginPayloadParams } from "thirdweb/auth";

/**
 * Handles the registration request by creating a new user and generating a Thirdweb authentication payload.
 *
 * @route POST /v1/auth/register
 * @access Public
 * @param req The request object containing the user data to be registered.
 * @param res The response object.
 */
const register = catchAsync(async (req: Request, res: Response) => {
  const { chainId, ...rest } = req.body;
  const userBody: Omit<Prisma.UserCreateInput, "userType"> & {
    userType: string;
  } = rest;

  const user = await userService.createUser(userBody);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not created");
  }

  const genarateAuthToken = await tokenService.genarateThirdwebAuth(
    userBody.walletAddress,
    req.body.chainId
  );

  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "User created successfully",
    data: {
      user,
      payload: genarateAuthToken,
    },
  });
});

/**
 * Handles the login request by generating a Thirdweb authentication payload.
 *
 * @route GET /v1/auth/login/request
 * @access Public
 * @param req The request object containing query parameters for wallet address and chain ID.
 * @param res The response object.
 */
const loginRequest = catchAsync(async (req: any, res: any) => {
  const { walletAddress: walletAddressQuery, chainId: chainIdQuery } =
    req.query;

  const walletAddress =
    typeof walletAddressQuery === "string" ? walletAddressQuery : "string";

  const chainId = typeof chainIdQuery === "string" ? chainIdQuery : undefined;

  const user = await userService.getUserByUniqueValue(
    {
      walletAddress: walletAddress.toLowerCase(),
    },
    {
      listener: true,
      artist: true,
    }
  );

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: "error",
      message: "User not found",
    });
  }

  const genarateAuthToken = await tokenService.genarateThirdwebAuth(
    walletAddress,
    chainId
  );

  return res
    .status(httpStatus.OK)
    .send({ status: "success", data: { payload: genarateAuthToken } });
});

const test = catchAsync(async (req: Request, res: Response) => {
  console.log("req.user", req.user);

  res.status(httpStatus.OK).send({ status: "success" });
});

/**
 * Logs in a user with a verified thirdweb payload.
 *
 * @route POST /v1/auth/login
 * @access Public
 * @param req The request object.
 * @param res The response object.
 */
const login = catchAsync(async (req: Request, res: Response) => {
  const payload: VerifyLoginPayloadParams = req.body;

  const tokens = await tokenService.generateThirdwebAuthTokens(payload);
  console.log("tokens", tokens);

  res.status(httpStatus.OK).send({
    status: ` ${tokens ? "success" : "error"}`,
    message: ` ${
      tokens ? "User logged in successfully" : "User not logged in"
    }`,
    data: { ...tokens },
  });
});

/**
 * Logs out a user by invalidating their refresh token.
 *
 * @route POST /v1/auth/logout
 * @access Public
 * @param req The request object.
 * @param res The response object.
 */
const logout = catchAsync(async (req: any, res: Response) => {
  console.log("req.body", req.body);
  const accessToken = req.body.accessToken;

  const logout = await authService.logout(accessToken);

  if (!logout) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to logout");
  }

  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "User logged out successfully" });
});

/**
 * Refreshes authentication tokens.
 *
 * @route POST /v1/auth/refresh
 * @access Public
 * @param req The request object.
 * @param res The response object.
 */
const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);

  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "Tokens refreshed", data: tokens });
});

/**
 * Checks if the user is logged in.
 *
 * @route POST /v1/auth/isLoggedIn
 * @access Public
 * @param req The request object.
 * @param res The response object.
 */
const isLoggedIn = catchAsync(async (req: any, res: Response) => {
  console.log("req.query.accessToken", req.query.accessToken);
  const isUserLoggedIn = await authService.isLoggedIn(
    req.query.accessToken,
    req.query.thirdwebToken
  );

  console.log("isUserLoggedIn", isUserLoggedIn);

  res.status(httpStatus.OK).send({
    status: `${isUserLoggedIn ? "success" : "error"}`,
    message: `User is ${
      isUserLoggedIn ? "logged in successfully" : "not logged in"
    }`,
    data: { isLoggedIn: isUserLoggedIn ? true : false },
  });
});

export {
  register,
  loginRequest,
  login,
  logout,
  refreshTokens,
  isLoggedIn,
  test,
};
