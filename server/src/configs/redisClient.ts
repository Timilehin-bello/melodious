import { config } from "./config";
import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST || config.redis.host || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || config.redis.port || "6379"),
  retryStrategy: (times: number) => {
    // Retry connection every 5 seconds for 10 times
    if (times <= 10) {
      return 5000;
    }
    return null;
  },
};

console.log("Redis connection config:", redisConfig);

const redisClient: Redis = new Redis(redisConfig);

if (
  config.redis.userPassword?.toUpperCase() === "YES" &&
  config.redis.password
) {
  redisClient.auth(config.redis.password);
}

export default redisClient;
