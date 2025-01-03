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
  // Create a new user using the user service

  const { chainId, ...rest } = req.body;
  const userBody: Omit<Prisma.UserCreateInput, "userType"> & {
    userType: string;
  } = rest;

  const user = await userService.createUser(userBody);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not created");
  }

  // Generate authentication tokens for the user
  const genarateAuthToken = await tokenService.genarateThirdwebAuth(
    userBody.walletAddress,
    req.body.chainId
  );

  // Set the status code to 201 (Created) and send the user and tokens as the response
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
  // Destructure walletAddress and chainId from the request query
  const { walletAddress: walletAddressQuery, chainId: chainIdQuery } =
    req.query;

  // Ensure the walletAddress is a string, fallback to a default value if not
  const walletAddress =
    typeof walletAddressQuery === "string" ? walletAddressQuery : "string";

  // Ensure the chainId is a string, fallback to undefined if not
  const chainId = typeof chainIdQuery === "string" ? chainIdQuery : undefined;

  // Retrieve the user by wallet address from the user service
  const user = await userService.getUserByUniqueValue({
    walletAddress: walletAddress.toLowerCase(),
  });

  // If the user is not found, throw a 'User not found' error
  if (!user) {
    // throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    return res.status(httpStatus.NOT_FOUND).json({
      status: "error",
      message: "User not found",
    });
  }

  // Generate a Thirdweb authentication token using the wallet address and chain ID
  const genarateAuthToken = await tokenService.genarateThirdwebAuth(
    walletAddress,
    chainId
  );

  // Respond with the generated authentication payload
  return res
    .status(httpStatus.OK)
    .send({ status: "success", data: { payload: genarateAuthToken } });
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

  res.status(httpStatus.OK).send({
    status: "success",
    message: "User logged in successfully",
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
  const refreshToken = req.body.refreshToken;

  // Call the logout function from the authService
  const logout = await authService.logout(refreshToken);

  if (!logout) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to logout");
  }

  // Send a "No Content" response
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
  // Call the `refreshAuth` function from the `authService` module
  const tokens = await authService.refreshAuth(req.body.refreshToken);

  // Send the tokens in the response
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
  // Call the `isLoggedIn` function from the `authService` module
  console.log("req.query.accessToken", req.query.accessToken);
  const isUserLoggedIn = await authService.isLoggedIn(
    req.query.accessToken,
    req.query.thirdwebToken
  );

  console.log("isUserLoggedIn", isUserLoggedIn);

  // if (!isUserLoggedIn) {
  //   // If the user is not logged in, throw an error
  //   throw new ApiError(httpStatus.UNAUTHORIZED, "User not logged in");
  // }

  // If the user is logged in, send a success response
  res.status(httpStatus.OK).send({
    status: "success",
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
  // , getUsers
};
