import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
// Route imports
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import projectRoutes from "./routes/project.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import mentorRoutes from "./routes/mentor.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import userRoutes from "./routes/user.routes.js";
import studentRoutes from "./routes/student.routes.js";
import surveyRoutes from "./routes/survey.routes.js";
import batchRoutes from "./routes/batch.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

// Middleware imports
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

// Security headers
app.use(helmet());

// CORS - allow frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: "Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// ROUTES
// ==========================================

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    message: "🚀 BootcampSewu API is running!",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/modules", moduleRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/mentor", mentorRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/portfolio", portfolioRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/survey", surveyRoutes);
app.use("/api/v1/batches", batchRoutes);
app.use("/api/v1/upload", uploadRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route tidak ditemukan.",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
