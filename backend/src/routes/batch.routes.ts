import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createBatch,
  getBatchesByCourse,
  getBatchById,
  updateBatch,
  deleteBatch,
  assignStudentToBatch,
} from "../controllers/batch.controller.js";

const router = Router();

// All routes require authentication
router.use(protect);

// CRUD
router.post("/", authorize("admin", "mentor"), createBatch);
router.get("/course/:courseId", getBatchesByCourse);
router.get("/:id", getBatchById);
router.put("/:id", authorize("admin", "mentor"), updateBatch);
router.delete("/:id", authorize("admin"), deleteBatch);

// Assign student
router.post("/:id/assign", authorize("admin", "mentor"), assignStudentToBatch);

export default router;
