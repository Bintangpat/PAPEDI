import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Enroll user to course (Manual)
 * @route   PATCH /api/v1/admin/enroll
 * @access  Private (Admin)
 */
export const enrollUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    throw new AppError("User ID dan Course ID wajib diisi.", 400);
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {
      activatedById: req.user!.id,
    },
    create: {
      userId,
      courseId,
      activatedById: req.user!.id,
    },
  });

  res.status(200).json({
    success: true,
    message: "User berhasil di-enroll ke kursus.",
    data: enrollment,
  });
});

/**
 * @desc    Get Admin Dashboard Stats
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin)
 */
export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const totalUsers = await prisma.user.count({
      where: { role: "student" },
    });
    const totalCourses = await prisma.course.count();
    const totalEnrollments = await prisma.enrollment.count();
    const totalMentors = await prisma.user.count({
      where: { role: "mentor" },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalMentors,
      },
    });
  },
);
