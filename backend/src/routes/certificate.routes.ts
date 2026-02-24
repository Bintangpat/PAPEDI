import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  getCertificate,
  generateCertificate,
} from "../controllers/certificate.controller.js";

const router = Router();

// Public Access
// Public Access (Verification)
router.get("/:id", getCertificate);

// Protected (Student Generate)
router.post("/", protect, authorize(Role.student), generateCertificate);

export default router;
