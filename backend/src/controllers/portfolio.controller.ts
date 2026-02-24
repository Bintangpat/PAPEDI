import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get Public User Profile
 * @route   GET /api/v1/portfolio/:userId
 * @access  Public
 */
export const getPublicProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId || typeof userId !== "string") {
      throw new AppError("Invalid User ID", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        portfolioUrl: true,
        role: true,
        createdAt: true,
        // Show enrolled courses (completed only?)
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                category: true,
              },
            },
          },
        },
        // Show project submissions (only LULUS)
        projectSubmissions: {
          where: {
            status: "LULUS",
          },
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        // Show certificates
        certificates: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User tidak ditemukan.", 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  },
);
