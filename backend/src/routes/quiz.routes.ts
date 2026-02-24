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

// Student: Get Quiz & Submit
router.get("/module/:moduleId", protect, getQuizByModuleId);
router.get("/:id", protect, getQuizById);
router.get(
  "/module/:moduleId/editor",
  protect,
  authorize(Role.admin, Role.mentor),
  getQuizForEditor,
);
router.post("/:id/submit", protect, authorize(Role.student), submitQuiz);

// Admin/Mentor: Create/Update Quiz
router.post("/", protect, authorize(Role.admin, Role.mentor), upsertQuiz);

export default router;
