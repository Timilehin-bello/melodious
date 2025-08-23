import Joi from "joi";

const createSubscriptionPlan = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    level: Joi.string().valid("FREE", "PREMIUM").required(),
    price: Joi.number().min(0).required(),
    duration: Joi.number().integer().min(1).required(),
    features: Joi.object().required(),
  }),
};

const getSubscriptionPlan = {
  params: Joi.object().keys({
    planId: Joi.number().integer().required(),
  }),
};

const createSubscription = {
  body: Joi.object().keys({
    listenerId: Joi.number().integer().required(),
    planId: Joi.number().integer().required(),
    autoRenew: Joi.boolean().optional(),
  }),
};

const getSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
};

const getActiveSubscription = {
  params: Joi.object().keys({
    listenerId: Joi.number().integer().required(),
  }),
};

const getListenerSubscriptions = {
  params: Joi.object().keys({
    listenerId: Joi.number().integer().required(),
  }),
};

const cancelSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
};

const renewSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
};

const processSubscriptionPayment = {
  body: Joi.object().keys({
    listenerId: Joi.number().integer().required(),
    planId: Joi.number().integer().required(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().optional().default("ETH"),
    transactionHash: Joi.string().optional(),
    vaultDepositId: Joi.string().optional(),
  }),
};

const confirmSubscriptionPayment = {
  params: Joi.object().keys({
    paymentId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    transactionHash: Joi.string().required(),
  }),
};

const getPayment = {
  params: Joi.object().keys({
    paymentId: Joi.string().required(),
  }),
};

const getListenerPayments = {
  params: Joi.object().keys({
    listenerId: Joi.number().integer().required(),
  }),
};

const monitorVaultDeposit = {
  params: Joi.object().keys({
    vaultDepositId: Joi.string().required(),
  }),
};

// Voucher-based subscription validations
const createVoucherSubscription = {
  body: Joi.object().keys({
    listenerId: Joi.number().integer().required(),
    planId: Joi.number().integer().required(),
    walletAddress: Joi.string().required(),
    amount: Joi.number().min(0).required(),
  }),
};

const activateVoucherSubscription = {
  body: Joi.object().keys({
    voucherId: Joi.string().required(),
    transactionHash: Joi.string().required(),
  }),
};

const getSubscriptionByVoucher = {
  params: Joi.object().keys({
    voucherId: Joi.string().required(),
  }),
};

const cancelVoucherSubscription = {
  params: Joi.object().keys({
    voucherId: Joi.string().required(),
  }),
};

const processVoucherPaymentRequest = {
  body: Joi.object().keys({
    listenerId: Joi.number().integer().required(),
    planId: Joi.number().integer().required(),
    walletAddress: Joi.string().required(),
    amount: Joi.number().min(0).required(),
  }),
};

export {
  createSubscriptionPlan,
  getSubscriptionPlan,
  createSubscription,
  getSubscription,
  getActiveSubscription,
  getListenerSubscriptions,
  cancelSubscription,
  renewSubscription,
  processSubscriptionPayment,
  confirmSubscriptionPayment,
  getPayment,
  getListenerPayments,
  monitorVaultDeposit,
  createVoucherSubscription,
  activateVoucherSubscription,
  getSubscriptionByVoucher,
  cancelVoucherSubscription,
  processVoucherPaymentRequest,
};
