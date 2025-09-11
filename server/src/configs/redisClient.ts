import { config } from "./config";
import Redis from "ioredis";

const url = `${config.redis.protocol}://${config.redis.host}:${config.redis.port}`;

const prodUrl = `${config.redis.protocol}://${config.redis.username}:${config.redis.password}@${config.redis.host}:${config.redis.port}`;

console.log("redisURL: " + url);
const redisClient = new Redis(config.env === "production" ? prodUrl : url);

redisClient.on("error", (err) => {
  console.log("redis error", err);
});

export default redisClient;
