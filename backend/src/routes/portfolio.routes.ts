import { Router } from "express";
import { getPublicProfile } from "../controllers/portfolio.controller.js";

const router = Router();

// Public Access
router.get("/:userId", getPublicProfile);

export default router;
