import * as userService from "./user.service";
import * as authService from "./auth.service";
import * as tokenService from "./token.service";
import * as transactionService from "./transaction.service";
import * as cronService from "./cron.service";
import * as subscriptionPaymentService from "./subscriptionPayment.service";
import * as subscriptionService from "./subscription.service";
import * as voucherSubscriptionService from "./voucherSubscription.service";
import PaymentTrackingService from "./paymentTracking.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const paymentTrackingService = new PaymentTrackingService();

export {
  prisma,
  userService,
  authService,
  tokenService,
  transactionService,
  cronService,
  subscriptionPaymentService,
  subscriptionService,
  voucherSubscriptionService,
  paymentTrackingService,
};
