import Joi from "joi";
import { ethAddress, objectId } from "./custom.validation";
import { add } from "date-fns";

const register = {
  body: Joi.object().keys({
    walletAddress: Joi.string().required().custom(ethAddress),
    name: Joi.string().required(),
    displayName: Joi.string().required(),
    profileImage: Joi.string(),
    country: Joi.string(),
    userType: Joi.object()
      .valid("LISTENER", "ARTIST")
      //  .keys({
      //    LISTENER: Joi.string().valid("LISTENER"),
      //    ARTIST: Joi.string().valid("ARTIST"),
      //  })
      .required(),
    chainId: Joi.string()
      .valid("1", "137", "43114", "11155111")
      .required()
      .custom(ethAddress),
  }),
};

const loginRequest = {
  query: Joi.object().keys({
    walletAddress: Joi.string().required(),
    chainId: Joi.string()
      .valid("1", "137", "43114", "11155111")
      .required()
      .custom(ethAddress),
  }),
};

const login = {
  body: Joi.object().keys({
    payload: Joi.object()
      .keys({
        address: Joi.string().required(),
        chain_id: Joi.string().optional(),
        domain: Joi.string().required(),
        expiration_time: Joi.string().required(),
        invalid_before: Joi.string().required(),
        issued_at: Joi.string().required(),
        nonce: Joi.string().required(),
        resources: Joi.array().optional().items(Joi.string()),
        statement: Joi.string().required(),
        uri: Joi.string().optional(),
        version: Joi.string().required(),
      })
      .required(),
    signature: Joi.string().optional(),
  }),
};

export { register, loginRequest, login };
