import httpStatus from "http-status";
import { User } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { userService, tokenService, prisma } from ".";
import { tokenTypes } from "../configs/enums";
import { thirdwebAuth } from "../configs/thirdwebClient";

const logout = async (accessToken: string): Promise<boolean> => {
  const accessTokenDoc = await prisma.token.findFirst({
    where: {
      token: accessToken,
      type: tokenTypes.ACCESS,
      blacklisted: false,
    },
  });

  if (!accessTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }

  const deleteTokenDoc = await prisma.token.deleteMany({
    where: {
      userId: accessTokenDoc?.userId,
    },
  });

  if (!deleteTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  // await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
  return true;
};

const refreshAuth = async (refreshToken: string): Promise<Object> => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken);
    const user = await userService.getUserByUniqueValue({
      id: refreshTokenDoc.userId,
    });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

const isLoggedIn = async (accessToken: string, thirdwebToken: string) => {
  try {
    console.log("accessToken", accessToken);
    const thirdwebTokenDoc = await tokenService.verifyToken(accessToken);

    if (!thirdwebTokenDoc) {
      return false;
    }

    const authResult = await thirdwebAuth.verifyJWT({
      jwt: thirdwebToken,
    });

    if (!authResult.valid) {
      return false;
    }

    return true;
  } catch (error) {}
};

export { logout, refreshAuth, isLoggedIn };
