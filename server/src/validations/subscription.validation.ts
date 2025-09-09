import Joi from "joi";

const createSubscription = {
  body: Joi.object().keys({
    planType: Joi.string().valid("BASIC", "PREMIUM", "ARTIST").required(),
    paymentMethod: Joi.string().valid("STRIPE", "PAYPAL", "CRYPTO").required(),
    paymentId: Joi.string().required(),
    autoRenew: Joi.boolean().default(true),
  }),
};

const processPayment = {
  body: Joi.object().keys({
    subscriptionId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(4).uppercase().default("CTSI"),
    paymentMethod: Joi.string().valid("STRIPE", "PAYPAL", "CRYPTO").required(),
    paymentId: Joi.string().required(),
    paymentData: Joi.object().optional(),
  }),
};

const updateSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.number().integer().positive().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid("ACTIVE", "CANCELLED", "EXPIRED", "PENDING")
      .optional(),
    autoRenew: Joi.boolean().optional(),
    cancelReason: Joi.string().optional(),
  }),
};

const getSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.number().integer().positive().required(),
  }),
};

const getUserSubscriptions = {
  query: Joi.object().keys({
    status: Joi.string()
      .valid("ACTIVE", "CANCELLED", "EXPIRED", "PENDING")
      .optional(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
  }),
};

const createSubscriptionPlan = {
  body: Joi.object().keys({
    name: Joi.string().valid("BASIC", "PREMIUM", "ARTIST").required(),
    displayName: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default("CTSI"),
    duration: Joi.number().integer().positive().required(),
    features: Joi.object().required(),
  }),
};

const processVoucherExecution = {
  body: Joi.object().keys({
    subscriptionId: Joi.number().integer().positive().required(),
    paymentId: Joi.string().required(),
    transactionHash: Joi.string().required(),
  }),
};

export {
  createSubscription,
  processPayment,
  processVoucherExecution,
  updateSubscription,
  getSubscription,
  getUserSubscriptions,
  createSubscriptionPlan,
};
