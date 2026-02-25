import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  getQuizByModuleId,
  getQuizById,
  getQuizForEditor,
  upsertQuiz,
  submitQuiz,
} from "../controllers/quiz.controller.js";

const router = Router();

// ─── MORE SPECIFIC routes FIRST ───────────────────────────────────────────────

// Mentor/Admin: Get full quiz with correct answers for editing
// MUST be before GET /:id — otherwise "module" gets caught as :id
router.get(
  "/module/:moduleId/editor",
  protect,
  authorize(Role.admin, Role.mentor),
  getQuizForEditor,
);

// Student: Get quiz by moduleId (questions only, no answers)
router.get("/module/:moduleId", protect, getQuizByModuleId);

// Student: Submit quiz answers
router.post("/:id/submit", protect, authorize(Role.student), submitQuiz);

// Student: Get quiz by quiz ID
router.get("/:id", protect, getQuizById);

// ─── Admin/Mentor: Create or Update Quiz ──────────────────────────────────────
router.post("/", protect, authorize(Role.admin, Role.mentor), upsertQuiz);

export default router;
