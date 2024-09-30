import { config } from "../configs/config";
import { createThirdwebClient } from "thirdweb";
import { createAuth } from "thirdweb/auth";

import { privateKeyToAccount } from "thirdweb/wallets";
import moment from "moment";

const secretKey = config.thirdweb.secretKey!;

export const thirdwebClient = createThirdwebClient({ secretKey });

const accessTokenExpires = moment().add(
  config.jwt.accessExpirationMinutes,
  "minutes"
);

const expirationTimeSeconds = accessTokenExpires.diff(moment(), "seconds");

export const thirdwebAuth = createAuth({
  domain: process.env.CLIENT_DOMAIN!,
  client: thirdwebClient,

  login: {
    statement: "Login to your account",
    version: "1.0",
    resources: [],
    uri: process.env.CLIENT_DOMAIN!,
  },

  jwt: {
    expirationTimeSeconds,
  },

  adminAccount: privateKeyToAccount({
    client: thirdwebClient,
    privateKey: process.env.ADMIN_PRIVATE_KEY!,
  }),
});
