import IORedis from "ioredis";
import { log } from "console";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = new IORedis(redisUrl, { maxRetriesPerRequest: null });

redisClient.on("connect", () => {
  log("Connected to Redis successfully");
});

redisClient.on("error", (err) => {
  log("Redis connection error:", err);
});

export default redisClient;
