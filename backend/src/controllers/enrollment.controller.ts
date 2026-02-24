import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Enroll in a course
 * @route   POST /api/v1/enrollments/:courseId
 * @access  Private (Student)
 */
export const enrollCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params as { courseId: string };
    const userId = req.user!.id;

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError("Kursus tidak ditemukan.", 404);
    }

    if (!course.isPublished) {
      throw new AppError("Kursus ini belum dipublikasikan.", 400);
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new AppError("Anda sudah terdaftar di kursus ini.", 400);
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          select: {
            title: true,
            thumbnail: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Berhasil mendaftar kursus.",
      data: enrollment,
    });
  },
);

/**
 * @desc    Get my enrollments
 * @route   GET /api/v1/enrollments/me
 * @access  Private (Student)
 */
export const getMyEnrollments = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            creator: {
              select: { name: true },
            },
            _count: {
              select: { modules: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  },
);

/**
 * @desc    Check enrollment status
 * @route   GET /api/v1/enrollments/:courseId/check
 * @access  Private (Student)
 */
export const checkEnrollment = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params as { courseId: string };
    const userId = req.user!.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        isEnrolled: false,
        data: null,
      });
    }

    // Fetch passed projects
    const passedProjects = await prisma.projectSubmission.findMany({
      where: {
        userId,
        courseId,
        status: "LULUS",
      },
      select: { projectId: true },
    });

    const completedProjects = passedProjects
      .map((p) => p.projectId)
      .filter((id): id is string => !!id);

    res.status(200).json({
      success: true,
      isEnrolled: true,
      data: {
        ...enrollment,
        completedProjects,
      },
    });
  },
);

/**
 * @desc    Mark lesson as complete
 * @route   POST /api/v1/enrollments/:courseId/lessons/:lessonId/complete
 * @access  Private (Student)
 */
export const markLessonComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId, lessonId } = req.params as {
      courseId: string;
      lessonId: string;
    };
    const userId = req.user!.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new AppError("Anda belum terdaftar di kursus ini.", 403);
    }

    // Add lessonId to completedLessons if not already present
    // Prisma doesn't support addToSet for scalar arrays easily in update, so we fetch, check, update
    const completedLessons = enrollment.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          completedLessons: {
            push: lessonId,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Materi ditandai selesai.",
    });
  },
);
