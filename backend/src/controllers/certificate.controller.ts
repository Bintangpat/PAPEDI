import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateFinalScore } from "./enrollment.controller.js";

/**
 * Helper: Calculate grade letter from score
 */
function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}

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
        OR: [
          { id: id as string },
          { serialNumber: id as string },
          { verificationToken: id as string },
        ],
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
            createdBy: true,
            certificateTemplate: {
              select: {
                bgImageUrl: true,
                textBlocks: true,
              },
            },
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
      include: {
        moduleProgress: true,
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
        course: {
          select: {
            title: true,
            description: true,
            createdBy: true,
            certificateTemplate: {
              select: { bgImageUrl: true, textBlocks: true },
            },
          },
        },
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

    // 3. Validate Completion — Check all modules are completed
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: { select: { id: true } },
            quiz: { select: { id: true } },
            project: { select: { id: true } },
          },
        },
      },
    });

    if (!course) throw new AppError("Kursus tidak ditemukan.", 404);

    // Check all ModuleProgress are COMPLETED
    const allModulesCompleted =
      enrollment.moduleProgress.length > 0 &&
      enrollment.moduleProgress.length >= course.modules.length &&
      enrollment.moduleProgress.every((mp) => mp.status === "COMPLETED");

    if (!allModulesCompleted) {
      const completedCount = enrollment.moduleProgress.filter(
        (mp) => mp.status === "COMPLETED",
      ).length;
      throw new AppError(
        `Belum menyelesaikan semua modul. (${completedCount}/${course.modules.length})`,
        400,
      );
    }

    // Check Projects — all must be LULUS
    let totalProjects = 0;
    const projectIds: string[] = [];
    course.modules.forEach((mod) => {
      if (mod.project) {
        totalProjects += 1;
        projectIds.push(mod.project.id);
      }
    });

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

    // 4. Calculate Final Score & Grade
    const finalScore = await calculateFinalScore(userId, courseId);

    if (finalScore === null || finalScore < 80) {
      throw new AppError(
        `Nilai akhir belum memenuhi syarat minimum (80). Nilai saat ini: ${finalScore ?? 0}`,
        400,
      );
    }

    const grade = getGrade(finalScore);

    // 5. Generate Certificate
    const serialNumber =
      `BS-${Date.now()}-${userId.substring(0, 4)}-${courseId.substring(0, 4)}`.toUpperCase();
    const verificationToken = crypto.randomUUID();

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        enrollmentId: enrollment.id,
        serialNumber,
        finalScore,
        grade,
        status: "ISSUED",
        verificationToken,
      },
      include: {
        user: { select: { name: true, email: true } },
        course: {
          select: {
            title: true,
            description: true,
            createdBy: true,
            certificateTemplate: {
              select: { bgImageUrl: true, textBlocks: true },
            },
          },
        },
      },
    });

    // Update enrollment
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "COMPLETED",
        finalScore,
        isEligibleCert: true,
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

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

/**
 * @desc    Admin — Get all certificate templates
 * @route   GET /api/v1/certificates/admin/templates
 * @access  Private (Admin)
 */
export const adminGetTemplates = asyncHandler(
  async (_req: Request, res: Response) => {
    const templates = await prisma.certificateTemplate.findMany({
      include: {
        course: {
          select: { id: true, title: true, category: true, level: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: templates });
  },
);

/**
 * @desc    Admin — Get certificate template by courseId
 * @route   GET /api/v1/certificates/admin/templates/:courseId
 * @access  Private (Admin)
 */
export const adminGetTemplateByCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params as { courseId: string };

    const template = await prisma.certificateTemplate.findUnique({
      where: { courseId },
      include: {
        course: {
          select: { id: true, title: true, category: true, level: true },
        },
      },
    });

    if (!template) {
      throw new AppError("Template sertifikat tidak ditemukan.", 404);
    }

    res.status(200).json({ success: true, data: template });
  },
);

/**
 * @desc    Admin — Create certificate template
 * @route   POST /api/v1/certificates/admin/templates
 * @access  Private (Admin)
 */
export const adminCreateTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId, name, bgImageUrl, textBlocks } = req.body;

    if (!courseId || !name) {
      throw new AppError("courseId dan name wajib diisi.", 400);
    }

    // Check course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError("Kursus tidak ditemukan.", 404);

    // Check if template already exists
    const existing = await prisma.certificateTemplate.findUnique({
      where: { courseId },
    });
    if (existing) {
      throw new AppError(
        "Template untuk kursus ini sudah ada. Gunakan PUT untuk mengupdate.",
        409,
      );
    }

    const template = await prisma.certificateTemplate.create({
      data: {
        courseId,
        name,
        bgImageUrl: bgImageUrl || null,
        textBlocks: textBlocks || [],
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Template berhasil dibuat.",
      data: template,
    });
  },
);

/**
 * @desc    Admin — Update certificate template by courseId
 * @route   PUT /api/v1/certificates/admin/templates/:courseId
 * @access  Private (Admin)
 */
export const adminUpdateTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params as { courseId: string };
    const { name, bgImageUrl, textBlocks } = req.body;

    const existing = await prisma.certificateTemplate.findUnique({
      where: { courseId },
    });

    if (!existing) {
      throw new AppError(
        "Template tidak ditemukan. Buat terlebih dahulu dengan POST.",
        404,
      );
    }

    const updated = await prisma.certificateTemplate.update({
      where: { courseId },
      data: {
        ...(name && { name }),
        ...(bgImageUrl !== undefined && { bgImageUrl }),
        ...(textBlocks !== undefined && { textBlocks }),
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Template berhasil diupdate.",
      data: updated,
    });
  },
);

/**
 * @desc    Admin — Get all certificates for a course
 * @route   GET /api/v1/certificates/admin/course/:courseId
 * @access  Private (Admin)
 */
export const adminGetCourseCertificates = asyncHandler(
  async (req: Request, res: Response) => {
    const courseId = req.params.courseId as string;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError("Kursus tidak ditemukan.", 404);

    const certificates = await prisma.certificate.findMany({
      where: { courseId },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        course: { select: { title: true } },
      },
      orderBy: { issuedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  },
);

/**
 * @desc    Admin — Revoke a certificate
 * @route   PATCH /api/v1/certificates/admin/:id/revoke
 * @access  Private (Admin)
 */
export const adminRevokeCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const certificate = await prisma.certificate.findUnique({ where: { id } });
    if (!certificate) throw new AppError("Sertifikat tidak ditemukan.", 404);

    if (certificate.status === "REVOKED") {
      throw new AppError("Sertifikat sudah direvoke.", 400);
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Sertifikat berhasil direvoke.",
      data: updated,
    });
  },
);
