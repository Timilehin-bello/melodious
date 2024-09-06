import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

import { userService, tokenService, authService } from "../services";
import ApiError from "../utils/ApiError";

const register = catchAsync(async (req: Request, res: Response) => {
  // Create a new user using the user service

  const user = await userService.createUser(req.body);

  // Generate authentication tokens for the user
  const tokens = await tokenService.generateAuthTokens(user);

  // Set the status code to 201 (Created) and send the user and tokens as the response
  res.status(httpStatus.CREATED).send({
    status: "success",
    message: "User created successfully",
    data: {
      user,
      //  tokens
    },
  });
});

// const login = catchAsync(async (req: Request, res: Response) => {
//   // Extract email and password from request body
//   const { email, password } = req.body;

//   // Login user with the provided email and password
//   const user = await authService.loginUserWithEmailAndPassword(email, password);

//   // Generate authentication tokens for the logged in user
//   const tokens = await tokenService.generateAuthTokens(user);

//   // Prepare user response data
//   const userRes = {
//     id: user.id,
//     email: user.email,
//     firstName: user.firstName,
//     lastName: user.lastName,
//     phoneNumber: user.phoneNumber,
//     profileImage: user.profileImage,
//     role: user.role,
//     ...(user.clientProfile && { clientProfile: user.clientProfile }),
//     ...(user.designerProfile && { designerProfile: user.designerProfile }),
//   };

//   // Send user response and tokens to the client
//   res.send({
//     status: "success",
//     message: "User logged in successfully",
//     data: { user: userRes, tokens },
//   });
// });

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

export {
  register,
  //  login,
  logout,
  refreshTokens,
};
