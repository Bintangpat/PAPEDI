import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  getDashboardSummary,
  getDashboardProgress,
  getDashboardActivity,
  getDashboardCertificates,
  getDashboardRecommendations,
} from "../controllers/student.controller.js";

const router = Router();

// All routes require authentication + student role
router.use(protect);
router.use(authorize(Role.student));

router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/progress", getDashboardProgress);
router.get("/dashboard/activity", getDashboardActivity);
router.get("/dashboard/certificates", getDashboardCertificates);
router.get("/dashboard/recommendations", getDashboardRecommendations);

export default router;
