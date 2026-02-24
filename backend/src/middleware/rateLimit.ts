import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 50, // Limit each IP to 50 requests per `window`
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Terlalu banyak permintaan, coba lagi nanti.",
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 login/register attempts per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Terlalu banyak percobaan autentikasi, coba lagi nanti.",
});

export const resendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 3, // Limit each IP to 3 resend requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Terlalu banyak permintaan OTP, coba lagi nanti.",
});
