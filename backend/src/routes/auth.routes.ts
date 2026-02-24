import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  requestOtpLogin,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { authLimiter, resendOtpLimiter } from "../middleware/rateLimit.js";

const router = Router();

// Public routes with Rate Limiting
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/request-otp-login", authLimiter, requestOtpLogin);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Specific limit for resend
router.post("/resend-otp", resendOtpLimiter, resendOtp);

// Other public routes
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);

export default router;
