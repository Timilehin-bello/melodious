import { config } from "./config";
import Redis from "ioredis";

const url = `${config.redis.protocol}://${config.redis.host}:${config.redis.port}`;

const redisClient: Redis = new Redis(url);

if (config.redis.userPassword.toUpperCase() === "YES") {
  redisClient.auth(config.redis.password);
}

export default redisClient;
