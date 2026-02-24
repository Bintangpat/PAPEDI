import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  submitProject,
  getMySubmission,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  getProjectSubmissions,
  gradeProject,
  getProjectByModuleId,
} from "../controllers/project.controller.js";

const router = Router();

// Student: Submit & Get Status
router.post("/submit", protect, authorize(Role.student), submitProject);
router.get("/my", protect, authorize(Role.student), getMySubmission);

// Project Definitions (Mentor/Admin)
router.post("/", protect, authorize(Role.mentor, Role.admin), createProject);
router.put("/:id", protect, authorize(Role.mentor, Role.admin), updateProject);
router.delete(
  "/:id",
  protect,
  authorize(Role.mentor, Role.admin),
  deleteProject,
);
router.get("/:id", protect, getProjectById);
router.get("/module/:moduleId", protect, getProjectByModuleId);
router.get(
  "/:id/submissions",
  protect,
  authorize(Role.mentor, Role.admin),
  getProjectSubmissions,
);
router.put(
  "/submissions/:submissionId",
  protect,
  authorize(Role.mentor, Role.admin),
  gradeProject,
);

export default router;
