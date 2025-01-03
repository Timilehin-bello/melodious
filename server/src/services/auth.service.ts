import httpStatus from "http-status";
import { User } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { userService, tokenService, prisma } from ".";
import { tokenTypes } from "../configs/enums";
import { thirdwebAuth } from "../configs/thirdwebClient";

const logout = async (refreshToken: string): Promise<boolean> => {
  const refreshTokenDoc = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    },
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }

  const deleteTokenDoc = await prisma.token.deleteMany({
    where: {
      userId: refreshTokenDoc?.userId,
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
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );
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

const isLoggedIn = async (accessToken: string) => {
  try {
    console.log("accessToken", accessToken);
    const thirdwebTokenDoc = await tokenService.verifyToken(
      accessToken,
      tokenTypes.THIRDWEB
    );

    if (!thirdwebTokenDoc) {
      return false;
    }

    const authResult = await thirdwebAuth.verifyJWT({
      jwt: thirdwebTokenDoc.token,
    });

    if (!authResult.valid) {
      return false;
    }

    return true;
  } catch (error) {}
};

export { logout, refreshAuth, isLoggedIn };
