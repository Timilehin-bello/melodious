import Joi from "joi";
import { ethAddress, objectId } from "./custom.validation";
import { add } from "date-fns";

const socialMediaSchema = Joi.object({
  twitter: Joi.string().uri().optional(),
  instagram: Joi.string().uri().optional(),
  facebook: Joi.string().uri().optional(),
}).optional();

const baseUserSchema = {
  method: Joi.string().valid("create_user").required(),
  args: Joi.object({
    name: Joi.string().required().min(2).max(100),
    displayName: Joi.string().required().min(2).max(50),
    username: Joi.string()
      .required()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/),
    userType: Joi.string().valid("LISTENER", "ARTIST").required(),
    walletAddress: Joi.string().custom(ethAddress).required(),
    chainId: Joi.string()
      .valid("1", "137", "43114", "31337", "11155111")
      .required(),
  }),
};

const register2 = {
  body: Joi.alternatives().conditional("args.userType", {
    switch: [
      {
        is: "LISTENER",
        then: Joi.object({
          ...baseUserSchema,
          args: baseUserSchema.args.append({}),
        }),
      },
      {
        is: "ARTIST",
        then: Joi.object({
          ...baseUserSchema,
          args: baseUserSchema.args.append({
            biography: Joi.string().min(10).max(1000).required(),
            socialMediaLinks: socialMediaSchema,
          }),
        }),
      },
    ],
  }),
};

const register = {
  body: Joi.object().keys({
    walletAddress: Joi.string().required().custom(ethAddress),

    userType: Joi.object()
      .valid("LISTENER", "ARTIST")
      //  .keys({
      //    LISTENER: Joi.string().valid("LISTENER"),
      //    ARTIST: Joi.string().valid("ARTIST"),
      //  })
      .required(),
    chainId: Joi.string()
      .valid("1", "137", "43114", "31337", "11155111")
      .required()
      .custom(ethAddress),
  }),
};

const loginRequest = {
  query: Joi.object().keys({
    walletAddress: Joi.string().required(),
    chainId: Joi.string()
      .valid("1", "137", "43114", "31337", "11155111", "11155111")
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
    signature: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    accessToken: Joi.string().required(),
  }),
};

const isLoggedIn = {
  query: Joi.object().keys({
    accessToken: Joi.string().required(),
    thirdwebToken: Joi.string().required(),
  }),
};

export { register, loginRequest, login, logout, isLoggedIn };
