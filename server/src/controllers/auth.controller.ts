import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

import { userService, tokenService, authService } from "../services";
import ApiError from "../utils/ApiError";
import { Prisma } from "@prisma/client";
import { VerifyLoginPayloadParams } from "thirdweb/auth";

const register = catchAsync(async (req: Request, res: Response) => {
  // Create a new user using the user service
  const userBody: Omit<Prisma.UserCreateInput, "userType"> & {
    userType: { LISTENER: string; ARTIST: string };
    chainId?: string;
  } = req.body;

  const user = await userService.createUser(userBody);

  console.log("user", user);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not created");
  }

  // Generate authentication tokens for the user
  // const tokens = await tokenService.generateAuthTokens(user);

  const genarateAuthToken = await tokenService.genarateThirdwebAuth(
    userBody.walletAddress,
    userBody.chainId
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

const loginRequest = catchAsync(async (req: Request, res: Response) => {
  const { walletAddress: walletAddressQuery, chainId: chainIdQuery } =
    req.query;
  const walletAddress =
    typeof walletAddressQuery === "string" ? walletAddressQuery : "string";
  const chainId = typeof chainIdQuery === "string" ? chainIdQuery : undefined;

  const user = await userService.getUserByUniqueValue({ walletAddress });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const genarateAuthToken = await tokenService.genarateThirdwebAuth(
    walletAddress,
    chainId
  );

  res
    .status(httpStatus.OK)
    .send({ status: "success", data: { payload: genarateAuthToken } });
});

const login = catchAsync(async (req: Request, res: Response) => {
  //   // Extract email and password from request body
  //   const { email, password } = req.body;
  const payload: VerifyLoginPayloadParams = req.body;
  //   // Login user with the provided email and password
  //   const user = await authService.loginUserWithEmailAndPassword(email, password);

  //   // Generate authentication tokens for the logged in user
  const tokens = await tokenService.generateThirdwebAuthTokens(payload);

  // Send user response and tokens to the client
  res.send({
    status: "success",
    message: "User logged in successfully",
    data: { ...tokens },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Call the logout function from the authService
  await authService.logout(req.body.refreshToken);
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

export { register, loginRequest, login, logout, refreshTokens };
