import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  createCourse,
  getAllCourses,
  getAllCoursesAdmin,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
} from "../controllers/course.controller.js";

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────
// Hanya kursus yang sudah published
router.get("/", getAllCourses);

// ─── Protected ───────────────────────────────────────────────────────────────
// CATATAN: rute statis (/me, /admin) harus didaftarkan SEBELUM /:id
router.get("/me", protect, authorize(Role.mentor, Role.admin), getMyCourses);

// Admin — semua kursus (published & draft), limit default 25
router.get("/admin", protect, authorize(Role.admin), getAllCoursesAdmin);

// ─── By ID ───────────────────────────────────────────────────────────────────
router.get("/:id", getCourseById);

// ─── Mentor & Admin ──────────────────────────────────────────────────────────
router.post("/", protect, authorize(Role.mentor, Role.admin), createCourse);
router.put("/:id", protect, authorize(Role.mentor, Role.admin), updateCourse);
router.delete(
  "/:id",
  protect,
  authorize(Role.mentor, Role.admin),
  deleteCourse,
);

export default router;
