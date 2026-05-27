import express from "express";
import AssignmentController from "./assignment.controller";
import authMiddlware from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/generate", authMiddlware, AssignmentController.generateAssignment);
router.get("/", authMiddlware, AssignmentController.getAssignments);
router.get("/:id", authMiddlware, AssignmentController.getAssignmentById);
router.delete("/:id", authMiddlware, AssignmentController.deleteAssignment);

export default router;
