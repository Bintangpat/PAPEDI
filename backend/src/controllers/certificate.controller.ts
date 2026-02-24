import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get Certificate by Serial Number (or ID)
 * @route   GET /api/v1/certificates/:id
 * @access  Public
 */
export const getCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ id: id as string }, { serialNumber: id as string }],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
            description: true,
            createdBy: true, // To get Instructor name?
          },
        },
      },
    });

    if (!certificate) {
      throw new AppError("Sertifikat tidak valid atau tidak ditemukan.", 404);
    }

    // Get Instructor Name (Course Creator)
    const instructor = await prisma.user.findUnique({
      where: { id: (certificate as any).course.createdBy },
      select: { name: true },
    });

    res.status(200).json({
      success: true,
      data: {
        ...certificate,
        instructorName: instructor?.name || "BootcampSewu Instructor",
      },
    });
  },
);

/**
 * @desc    Generate Certificate for a Course
 * @route   POST /api/v1/certificates
 * @access  Private (Student)
 */
export const generateCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.body;
    const userId = req.user!.id;

    if (!courseId) {
      throw new AppError("Course ID wajib diisi.", 400);
    }

    // 1. Check Enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment) {
      throw new AppError("Anda belum terdaftar di kursus ini.", 403);
    }

    // 2. Check existing certificate
    const existingCert = await prisma.certificate.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, description: true, createdBy: true } },
      },
    });

    if (existingCert) {
      // Get Instructor Name
      const instructor = await prisma.user.findUnique({
        where: { id: existingCert.course.createdBy },
        select: { name: true },
      });

      return res.status(200).json({
        success: true,
        message: "Sertifikat sudah ada.",
        data: {
          ...existingCert,
          instructorName: instructor?.name || "BootcampSewu Instructor",
        },
      });
    }

    // 3. Validate Completion
    // Fetch Course with content counts
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lesson: { select: { id: true } },
            quiz: { select: { id: true } },
            project: { select: { id: true } },
          },
        },
      },
    });

    if (!course) throw new AppError("Kursus tidak ditemukan.", 404);

    let totalLessons = 0;
    let totalQuizzes = 0;
    let totalProjects = 0;
    const projectIds: string[] = [];

    course.modules.forEach((mod) => {
      totalLessons += mod.lesson.length;
      if (mod.quiz) totalQuizzes += 1; // Assuming 1 quiz per module via One-to-One? Schema said Quiz? (Optional One-to-One)
      if (mod.project) {
        totalProjects += 1;
        projectIds.push(mod.project.id);
      }
    });

    // Check Lessons
    if (enrollment.completedLessons.length < totalLessons) {
      throw new AppError(
        `Belum menyelesaikan semua materi. (${enrollment.completedLessons.length}/${totalLessons})`,
        400,
      );
    }

    // Check Quizzes
    // completedQuizzes stores IDs.
    // Wait, Schema said `completedQuizzes String[]`.
    // We assume these are IDs of PASSED quizzes.
    if (enrollment.completedQuizzes.length < totalQuizzes) {
      throw new AppError(
        `Belum lulus semua kuis. (${enrollment.completedQuizzes.length}/${totalQuizzes})`,
        400,
      );
    }

    // Check Projects
    if (totalProjects > 0) {
      const passedProjects = await prisma.projectSubmission.count({
        where: {
          userId,
          courseId,
          status: "LULUS",
          projectId: { in: projectIds },
        },
      });

      if (passedProjects < totalProjects) {
        throw new AppError(
          `Belum lulus semua project. (${passedProjects}/${totalProjects})`,
          400,
        );
      }
    }

    // 4. Generate Certificate
    const serialNumber =
      `BS-${Date.now()}-${userId.substring(0, 4)}-${courseId.substring(0, 4)}`.toUpperCase();

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        serialNumber,
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, description: true, createdBy: true } },
      },
    });

    const instructor = await prisma.user.findUnique({
      where: { id: certificate.course.createdBy },
      select: { name: true },
    });

    res.status(201).json({
      success: true,
      message: "Sertifikat berhasil dibuat.",
      data: {
        ...certificate,
        instructorName: instructor?.name || "BootcampSewu Instructor",
      },
    });
  },
);
