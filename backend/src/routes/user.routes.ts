import express from "express";
import { protect, authorize } from "../middleware/auth.js"; // Fixed import path
import { Role } from "@prisma/client"; // Import Role enum
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize(Role.admin)); // Use Role enum

router.route("/").get(getUsers);

router.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
