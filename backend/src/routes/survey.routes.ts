import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  submitSurvey,
  getSurveyResult,
} from "../controllers/survey.controller.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.post("/submit", submitSurvey);
router.get("/result", getSurveyResult);

export default router;
