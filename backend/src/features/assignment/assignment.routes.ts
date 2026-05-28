import express from "express";
import rateLimit from "express-rate-limit";
import AssignmentController from "./assignment.controller";
import authMiddlware from "../../middleware/auth.middleware";

const router = express.Router();

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many requests. Please try again after 15 minutes." },
});

router.post("/generate", authMiddlware, generateLimiter, AssignmentController.generateAssignment);
router.get("/status/:jobId", authMiddlware, AssignmentController.getAssignmentStatus);
router.get("/", authMiddlware, AssignmentController.getAssignments);
router.get("/:id", authMiddlware, AssignmentController.getAssignmentById);
router.delete("/:id", authMiddlware, AssignmentController.deleteAssignment);
router.post(
  "/:id/regenerate",
  authMiddlware,
  generateLimiter,
  AssignmentController.regenerateAssignment
);

export default router;
