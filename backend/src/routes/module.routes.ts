import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { Role } from "@prisma/client";
import {
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/module.controller.js";

const router = Router();

// Mentor & Admin
router.post("/", protect, authorize(Role.mentor, Role.admin), createModule);
router.put("/:id", protect, authorize(Role.mentor, Role.admin), updateModule);
router.delete(
  "/:id",
  protect,
  authorize(Role.mentor, Role.admin),
  deleteModule,
);

export default router;
