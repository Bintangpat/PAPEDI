import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  enrollUser,
  getDashboardStats,
} from "../controllers/admin.controller.js";

const router = Router();

// Admin only
router.patch("/enroll", protect, authorize(Role.admin), enrollUser);
router.get("/stats", protect, authorize(Role.admin), getDashboardStats);

export default router;
