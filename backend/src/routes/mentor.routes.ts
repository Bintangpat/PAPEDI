import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  getMentorStats,
  getSubmissions,
  gradeSubmission,
} from "../controllers/mentor.controller.js";

const router = Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize(Role.mentor));

router.get("/stats", getMentorStats);
router.get("/submissions", getSubmissions);
router.post("/submissions/:id/grade", gradeSubmission);

export default router;
