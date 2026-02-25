import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  getCertificate,
  generateCertificate,
  adminGetTemplates,
  adminGetTemplateByCourse,
  adminCreateTemplate,
  adminUpdateTemplate,
  adminGetCourseCertificates,
  adminRevokeCertificate,
} from "../controllers/certificate.controller.js";

const router = Router();

// ========================
// Public Access
// ========================
router.get("/:id", getCertificate);

// ========================
// Protected (Student)
// ========================
router.post("/", protect, authorize(Role.student), generateCertificate);

// ========================
// Admin Routes
// ========================
const adminAuth = [protect, authorize(Role.admin)];

// Template management
router.get("/admin/templates", ...adminAuth, adminGetTemplates);
router.post("/admin/templates", ...adminAuth, adminCreateTemplate);
router.get(
  "/admin/templates/:courseId",
  ...adminAuth,
  adminGetTemplateByCourse,
);
router.put("/admin/templates/:courseId", ...adminAuth, adminUpdateTemplate);

// Certificate management per course
router.get("/admin/course/:courseId", ...adminAuth, adminGetCourseCertificates);
router.patch("/admin/:id/revoke", ...adminAuth, adminRevokeCertificate);

export default router;
