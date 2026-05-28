import { Worker } from "bullmq";
import redisClient from "./redis.config";
import { AssignmentService } from "../features/assignment/assignment.service";

const assignmentService = new AssignmentService();

const worker = new Worker(
  "jobs",
  async (job) => {
    if (job.name === "generate-assignment") {
      const assignment = await assignmentService.generateAssignment(job.data);
      return assignment._id.toString();
    }
    if (job.name === "regenerate-assignment") {
      const assignment = await assignmentService.regenerateAssignment(job.data);
      return assignment._id.toString();
    }
  },
  { connection: redisClient as any }
);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job!.id} has failed with ${err.message}`);
});

export default worker;
