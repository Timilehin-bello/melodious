import * as userService from "./user.service";
import * as authService from "./auth.service";
import * as tokenService from "./token.service";
import * as transactionService from "./transaction.service";
import * as cronService from "./cron.service";
import * as subscriptionService from "./subscription.service";
import { PrismaClient } from "@prisma/client";
import * as adService from "./ad.service";
const prisma = new PrismaClient();
export {
  prisma,
  userService,
  authService,
  tokenService,
  transactionService,
  cronService,
  subscriptionService,
    adService,
};
