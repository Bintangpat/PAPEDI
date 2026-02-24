import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Role } from "@prisma/client";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        name: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

/**
 * Middleware: Protect routes - verify JWT token
 */
export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Fallback to cookie
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError(
        "Anda belum login. Silakan login terlebih dahulu.",
        401,
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      throw new AppError("User dengan token ini sudah tidak ada.", 401);
    }

    req.user = user;
    next();
  },
);

/**
 * Middleware: Authorize by role(s)
 * Usage: authorize(Role.admin, Role.mentor)
 */
export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Anda belum login.", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "Anda tidak memiliki izin untuk mengakses resource ini.",
        403,
      );
    }

    next();
  };
};
