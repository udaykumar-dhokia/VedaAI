import express from "express";
import AdminController from "./admin.controller";
import authMiddlware from "../../middleware/auth.middleware";

const router = express.Router();

router.get("/", authMiddlware, AdminController.getAdmin);

export default router;
