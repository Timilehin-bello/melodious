import Joi from "joi";

const processPaymentRequest = {
  body: Joi.object().keys({
    message: Joi.string().required(),
    signer: Joi.string().required(),
    signature: Joi.string().required(),
  }),
};

const getVoucherStatus = {
  params: Joi.object().keys({
    voucherId: Joi.string().required(),
  }),
};

const getPaymentHistory = {
  params: Joi.object().keys({
    walletAddress: Joi.string().required(),
  }),
};

export {
  processPaymentRequest,
  getVoucherStatus,
  getPaymentHistory,
};