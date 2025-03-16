import Joi from "joi";
import { ethAddress } from "./custom.validation";

const checkIfUserAlreadyExists = {
  query: Joi.object().keys({
    walletAddress: Joi.string().required(),
    //     chainId: Joi.string()
    //       .valid("1", "137", "43114", "31337", "11155111", "84532")
    //       .required()
    //       .custom(ethAddress),
  }),
};

export { checkIfUserAlreadyExists };
