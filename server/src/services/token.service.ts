import * as jwt from "jsonwebtoken";
import { refreshJWT } from "thirdweb/utils";
import moment from "moment";
import { Prisma, Token, User } from "@prisma/client";

import { config } from "../configs/config";
import { tokenTypes } from "../configs/enums";

import { prisma, userService } from ".";
import { formatISO } from "date-fns";

import { createAuth, type VerifyLoginPayloadParams } from "thirdweb/auth";
import { thirdwebAuth, thirdwebClient } from "../configs/thirdwebClient";
import { error } from "console";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

const genarateThirdwebAuth = async (
  walletAddress: string,
  chainId: string | undefined
) => {
  try {
    return await thirdwebAuth.generatePayload({
      address: walletAddress,
      chainId: chainId ? parseInt(chainId) : undefined,
    });
  } catch (error) {
    throw error;
  }
};

const generateToken = (
  userId: number,
  expires: moment.Moment,
  type: string,
  secret = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };

  console.log("payload", payload);

  return jwt.sign(payload, secret);
};

const saveToken = async (
  input: Prisma.TokenCreateManyInput
): Promise<Token> => {
  return await prisma.token.create({
    data: input,
  });
};

const verifyToken = async (token: string): Promise<Token> => {
  //   let payload: any = false;
  //   if (type === TokenType.REFRESH) {
  //     payload = jwt.verify(token, config.jwt.secret);

  try {
    const payload: any = jwt.verify(token, config.jwt.secret);

    console.log("verifyToken payload", payload);

    console.log("verifyToken token", token);

    const tokenDoc = await prisma.token.findFirst({
      where: {
        token,
        userId: payload.sub,
        //  ...(payload.sub && { userId: payload.sub }),
        type: payload.type,
        expires: {
          gt: formatISO(new Date()),
        },
      },
    });

    console.log("tokenDoc", tokenDoc);

    if (!tokenDoc) {
      throw new Error("Token not found or expired");
    }

    return tokenDoc;
  } catch (error) {
    throw error;
  }
  //   }
};

const generateAuthTokens = async (
  user: User
): Promise<{
  access: { token: string; expires: Date };
  refresh: { token: string; expires: Date };
}> => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );

  // const expirationTimeSeconds = accessTokenExpires.diff(moment(), "seconds");
  // console.log("expirationTimeSeconds", expirationTimeSeconds);

  const accessToken = generateToken(
    user.id,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    user.id,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  await saveToken({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    userId: user.id,
    expires: refreshTokenExpires.toDate(),
  });

  await saveToken({
    token: accessToken,
    type: tokenTypes.ACCESS,
    userId: user.id,
    expires: accessTokenExpires.toDate(),
  });

  const tokens = {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };

  return tokens;
};

const generateThirdwebAuthTokens = async (
  payload: VerifyLoginPayloadParams
) => {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );

  console.log("verifiedPayload", verifiedPayload);

  if (verifiedPayload.valid) {
    const accessToken = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });

    console.log("accessToken thirdweb", accessToken);
    const user = await userService.getUserByUniqueValue({
      walletAddress: payload.payload.address.toLowerCase(),
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const tokens = await generateAuthTokens(user);

    await saveToken({
      token: accessToken,
      type: tokenTypes.THIRDWEB,
      userId: user.id,
      expires: accessTokenExpires.toDate(),
    });
    // console.log("tokens", tokens);

    return {
      user,
      tokens: {
        token: {
          ...tokens,
          thirdWebToken: { accessToken, expires: accessTokenExpires.toDate() },
        },
      },
    };
  }

  return false;

  // await saveToken({
  //   token: accessToken,
  //   type: tokenTypes.THIRDWEB,
  //   userId: user.id,
  //   expires: accessTokenExpires.toDate(),
  // });

  // const token = {
  //   access: {
  //     token: accessToken,
  //     expires: accessTokenExpires.toDate(),
  //   },
  // };

  // return token;

  // if(verifyPayload.valid) {
  //   const user = await getUserByUniqueValue({ walletAddress: payload.payload.address });

  //   if(!user) {
  //     throw new Error("User not found");
  //   }

  //   const tokens = await generateAuthTokens(user);

  //   return tokens;

  // }
};

export {
  genarateThirdwebAuth,
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateThirdwebAuthTokens,
};
