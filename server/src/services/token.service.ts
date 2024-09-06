import * as jwt from "jsonwebtoken";

import moment from "moment";
import { Prisma, Token, User } from "@prisma/client";

import { config } from "../configs/config";
import { tokenTypes } from "../configs/enums";

import { prisma } from ".";
import { formatISO } from "date-fns";

const generateToken = (
  userId: string,
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

  return jwt.sign(payload, secret);
};

const saveToken = async (
  input: Prisma.TokenCreateManyInput
): Promise<Token> => {
  return await prisma.token.create({
    data: input,
  });
};

const verifyToken = async (token: string, type: string): Promise<Token> => {
  //   let payload: any = false;
  //   if (type === TokenType.REFRESH) {
  //     payload = jwt.verify(token, config.jwt.secret);
  //   }

  const payload: any = jwt.verify(token, config.jwt.secret);

  const tokenDoc = await prisma.token.findFirst({
    where: {
      token,
      userId: payload.sub,
      //  ...(payload.sub && { userId: payload.sub }),
      type,
      expires: {
        gt: formatISO(new Date()),
      },
    },
  });

  if (!tokenDoc) {
    throw new Error("Token not found or expired");
  }

  return tokenDoc;
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

export { generateToken, saveToken, verifyToken, generateAuthTokens };
