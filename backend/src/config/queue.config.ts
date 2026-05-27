import { Queue } from "bullmq";
import redisClient from "./redis.config";

const jobs = new Queue("jobs", { connection: redisClient as any });

export default jobs;
