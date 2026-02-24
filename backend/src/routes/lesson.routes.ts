import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
} from "../controllers/lesson.controller.js";

const router = Router();

// Public/Private (Enrolled)
router.get("/:id", protect, getLessonById);

// Mentor & Admin
router.post("/", protect, authorize(Role.mentor, Role.admin), createLesson);
router.put("/:id", protect, authorize(Role.mentor, Role.admin), updateLesson);
router.delete(
  "/:id",
  protect,
  authorize(Role.mentor, Role.admin),
  deleteLesson,
);

export default router;
