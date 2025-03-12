import Joi from "joi";
import "dotenv/config";

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("development", "production", "local", "test")
      .required(),
    DATABASE_URL: Joi.string().required().description("Database URL"),
    PORT: Joi.number().default(8888).description("Port number"),
    RPC_URL: Joi.string().required().description("RPC URL"),
    PRIVATE_KEY: Joi.string()
      .required()
      .description("Private key for signing tx"),
    RELAYER_ADDRESS: Joi.string().required().description("Relayer address"),

    INPUTBOX_ADDRESS: Joi.string().required().description("Inpubox address"),
    DAPP_ADDRESS: Joi.string().required().description("Dapp address"),

    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),

    THIRDWEB_SECRET_KEY: Joi.string().required(),
    THIRDWEB_CLIENT_DOMAIN: Joi.string()
      .required()
      .default("localhost:3000")
      .description("The domain of your frontend"),
    ADMIN_PRIVATE_KEY: Joi.string()
      .required()
      .description("Admin wallet private key to genarate JWT"),

    LOG_FOLDER: Joi.string().required(),
    LOG_FILE: Joi.string().required(),
    LOG_LEVEL: Joi.string().required(),
    REDIS_HOST: Joi.string().default("127.0.0.1"),
    REDIS_PROTOCOL: Joi.string().default("redis"),

    REDIS_USER_PASSWORD: Joi.string().default("no"),
    REDIS_PASSWORD: Joi.string(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,

  rpcUrl: envVars.RPC_URL,
  privateKey: envVars.PRIVATE_KEY,
  relayerAddress: envVars.RELAYER_ADDRESS,
  inputboxAddress: envVars.INPUTBOX_ADDRESS,
  dappAddress: envVars.DAPP_ADDRESS,

  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },

  adminPrivateKey: envVars.ADMIN_PRIVATE_KEY,

  thirdweb: {
    secretKey: envVars.THIRDWEB_SECRET_KEY,
    clientDomain: envVars.THIRDWEB_CLIENT_DOMAIN,
  },

  logConfig: {
    logFolder: envVars.LOG_FOLDER,
    logFile: envVars.LOG_FILE,
    logLevel: envVars.LOG_LEVEL,
  },

  redis: {
    protocol: envVars.REDIS_PROTOCOL,
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    userPassword: envVars.REDIS_USER_PASSWORD,
    password: envVars.REDIS_PASSWORD,
  },
};
