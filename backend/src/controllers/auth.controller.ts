import { Request, Response, CookieOptions } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOTPEmail } from "../utils/sendEmail.js";

// Cookie Options
const ACCESS_TOKEN_EXPIRE = 15 * 60 * 1000; // 15 Minutes
const REFRESH_TOKEN_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 7 Days

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
};

// Helper to generate IDs/Tokens
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateAccessToken = (user: any): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );
};

const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString("hex");
};

const generateResetToken = (userId: string): string => {
  return jwt.sign(
    { id: userId, type: "reset" },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "10m", // Short lived for password reset
    },
  );
};

/**
 * @desc    Register user (Step 1: Send OTP)
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Nama, email, dan password wajib diisi.", 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser && existingUser.isVerified) {
    throw new AppError("Email sudah terdaftar.", 409);
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  let user = existingUser;

  if (existingUser) {
    // Upsert: Update details for unverified user
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: { name, passwordHash },
    });
  } else {
    // Create new user
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        isVerified: false,
      } as any,
    });
  }

  // Create OTP
  const otp = generateOTP();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes

  await prisma.otp.create({
    data: {
      userId: user!.id,
      otpHash,
      type: "REGISTER",
      expiresAt: otpExpires,
    },
  });

  try {
    await sendOTPEmail(email, otp, "REGISTER");
  } catch (err) {
    console.error("Failed to send OTP", err);
    // Continue even if email fails? Better to throw error so frontend knows?
    // But user is created.
  }

  res.status(200).json({
    success: true,
    message: "Registrasi berhasil! Cek email untuk kode OTP.",
    data: { email: user!.email },
  });
});

/**
 * @desc    Login (Step 1: Check Creds & Send OTP)
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Email dan password wajib diisi.", 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Email atau password salah.", 401);
  }

  if (!user.isVerified) {
    throw new AppError(
      "Akun belum diverifikasi. Silakan registrasi ulang atau verifikasi OTP.",
      403,
    );
  }

  const otp = generateOTP();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otp.create({
    data: {
      userId: user.id,
      otpHash,
      type: "LOGIN",
      expiresAt: otpExpires,
    },
  });

  try {
    await sendOTPEmail(email, otp, "LOGIN");
  } catch (err) {
    throw new AppError("Gagal mengirim OTP.", 500);
  }

  res.status(200).json({
    success: true,
    message: "OTP dikirim ke email.",
    data: { email: user.email },
  });
});

/**
 * @desc    Request OTP Login (No Password - for Switching Account or Direct OTP)
 */
export const requestOtpLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) throw new AppError("Email wajib diisi.", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("Email tidak terdaftar.", 404);
    }

    // Explicitly check verification
    if (!user.isVerified) {
      throw new AppError("Akun belum diverifikasi.", 403);
    }

    const otp = generateOTP();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({
      data: {
        userId: user.id,
        otpHash,
        type: "LOGIN",
        expiresAt: otpExpires,
      },
    });

    try {
      await sendOTPEmail(email, otp, "LOGIN");
    } catch (err) {
      throw new AppError("Gagal mengirim OTP.", 500);
    }

    res.status(200).json({
      success: true,
      message: `OTP dikirim ke ${email}.`,
      data: { email },
    });
  },
);

/**
 * @desc    Verify OTP & Set Cookies / Return Token
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, type } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("User tidak ditemukan.", 404);

  // Find valid OTP
  const validOtp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      type: type,
      expiresAt: { gt: new Date() },
      attempts: { lt: 5 }, // Max 5 attempts
    },
    orderBy: { createdAt: "desc" }, // Get latest
  });

  if (!validOtp) {
    throw new AppError("OTP tidak valid atau kadaluarsa.", 400);
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  if (hashedOtp !== validOtp.otpHash) {
    // Increment attempts
    await prisma.otp.update({
      where: { id: validOtp.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AppError("OTP salah.", 400);
  }

  // OTP Valid - Delete it (or mark used)
  await prisma.otp.delete({ where: { id: validOtp.id } });

  // Clear older OTPs for this user/type to keep DB clean
  await prisma.otp.deleteMany({
    where: { userId: user.id, type: type, id: { not: validOtp.id } },
  });

  if (type === "REGISTER") {
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    res
      .status(200)
      .json({ success: true, message: "Verifikasi berhasil! Silakan login." });
    return;
  }

  if (type === "FORGOT_PASSWORD") {
    const resetToken = generateResetToken(user.id);
    res.status(200).json({
      success: true,
      message: "OTP valid. Silakan reset password.",
      resetToken,
    });
    return;
  }

  // LOGIN: Generate Tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Save Refresh Token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE),
    },
  });

  // Set Cookies
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_EXPIRE,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_EXPIRE,
  });

  res.status(200).json({
    success: true,
    message: "Login berhasil!",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
});

/**
 * @desc    Refresh Access Token
 * @route   POST /api/v1/auth/refresh-token
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      throw new AppError(
        "Refresh token tidak ditemukan. Silakan login ulang.",
        401,
      );
    }

    // Find in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: incomingRefreshToken },
      include: { user: true },
    });

    // Validation
    if (!storedToken) {
      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);
      throw new AppError("Refresh token tidak valid.", 403);
    }

    // Check Revoked or Expired
    if (storedToken.revoked || new Date() > storedToken.expiresAt) {
      // Revoke family of tokens? For now just delete/revoke this one
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });
      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);
      throw new AppError("Sesi habis. Silakan login ulang.", 403);
    }

    // Rotate Token
    const newAccessToken = generateAccessToken(storedToken.user);
    const newRefreshToken = generateRefreshToken();

    // Revoke old, Create new (Rotation)
    // Transaction to ensure consistency
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true }, // Mark old as revoked
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.userId,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE),
        },
      }),
    ]);

    // Set New Cookies
    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_EXPIRE,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_EXPIRE,
    });

    res.json({ success: true, message: "Token refreshed" });
  },
);

/**
 * @desc    Logout
 * @route   POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (incomingRefreshToken) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: incomingRefreshToken },
    });
    if (storedToken) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });
    }
  }

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({ success: true, message: "Logout berhasil." });
});

/**
 * @desc    Resend OTP
 */
export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, type } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("User tidak ditemukan.", 404);

  const otp = generateOTP();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  // Use Upsert logic or just Create?
  // Let's create new one, verifyOtp filters by latest/expiresAt.
  // Ideally we should invalidate previous active ones.

  await prisma.otp.updateMany({
    where: { userId: user.id, type: type, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() }, // Expire immediately
  });

  await prisma.otp.create({
    data: {
      userId: user.id,
      otpHash,
      type: type || "LOGIN", // Default fallback
      expiresAt: otpExpires,
    },
  });

  try {
    await sendOTPEmail(email, otp, type);
    res.status(200).json({ success: true, message: "OTP dikirim ulang." });
  } catch (error) {
    throw new AppError("Gagal mengirim ulang OTP.", 500);
  }
});

/**
 * @desc    Forgot Password
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Always return success to prevent enumeration (Security Requirement)
    const genericResponse = {
      success: true,
      message: "Jika email terdaftar, instruksi reset password telah dikirim.",
    };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if not found
      res.status(200).json(genericResponse);
      return;
    }

    const otp = generateOTP();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({
      data: {
        userId: user.id,
        otpHash,
        type: "FORGOT_PASSWORD",
        expiresAt: otpExpires,
      },
    });

    try {
      await sendOTPEmail(email, otp, "RESET");
    } catch (error) {
      // Log error but don't leak failure
      console.error("Forgot Password Email Failed:", error);
    }

    res.status(200).json(genericResponse);
  },
);

/**
 * @desc    Reset Password
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      throw new AppError("Token dan password baru wajib diisi.", 400);
    }

    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string);
    } catch (err) {
      throw new AppError(
        "Token reset password tidak valid atau kadaluarsa.",
        400,
      );
    }

    if (decoded.type !== "reset" || !decoded.id) {
      throw new AppError("Token tidak valid.", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new AppError("User tidak ditemukan.", 404);

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password & Revoke all sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Password berhasil direset. Silakan login.",
    });
  },
);

/**
 * @desc    Get Current User
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      portfolioUrl: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError("User tidak ditemukan.", 404);

  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Update Profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, bio, portfolioUrl, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        portfolioUrl: true,
        updatedAt: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui!",
      data: user,
    });
  },
);
