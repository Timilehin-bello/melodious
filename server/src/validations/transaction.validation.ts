import Joi from "joi";

const sendTransactionRequest = {
  body: Joi.object().keys({
    message: Joi.string().required(),
    signer: Joi.string().required(),
    signature: Joi.string().required(),
  }),
};

export { sendTransactionRequest };
