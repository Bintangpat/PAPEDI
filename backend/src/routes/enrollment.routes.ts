import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  enrollCourse,
  getMyEnrollments,
  checkEnrollment,
  markLessonComplete,
} from "../controllers/enrollment.controller.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.get("/me", getMyEnrollments);
router.post("/:courseId", enrollCourse);
router.get("/:courseId/check", checkEnrollment);
router.post("/:courseId/lessons/:lessonId/complete", markLessonComplete);

export default router;
