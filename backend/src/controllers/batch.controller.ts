import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Create a new batch for a course
 * @route   POST /api/v1/batches
 * @access  Private (Admin/Mentor)
 */
export const createBatch = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, name, startDate, endDate, maxStudents } = req.body;

  if (!courseId || !name) {
    throw new AppError("Course ID dan nama batch wajib diisi.", 400);
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
  });

  if (!course) throw new AppError("Kursus tidak ditemukan.", 404);

  // Authorization: mentor can only create batches for their own courses
  if (req.user!.role === "mentor" && course.createdBy !== req.user!.id) {
    throw new AppError(
      "Tidak memiliki akses untuk membuat batch di kursus ini.",
      403,
    );
  }

  const batch = await prisma.batch.create({
    data: {
      courseId,
      name,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      maxStudents: maxStudents ?? null,
      isActive: true,
    },
  });

  res.status(201).json({
    success: true,
    message: "Batch berhasil dibuat.",
    data: batch,
  });
});

/**
 * @desc    Get all batches for a course
 * @route   GET /api/v1/batches/course/:courseId
 * @access  Private (Admin/Mentor)
 */
export const getBatchesByCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const batches = await prisma.batch.findMany({
      where: { courseId: courseId as string },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: batches,
    });
  },
);

/**
 * @desc    Get batch by ID
 * @route   GET /api/v1/batches/:id
 * @access  Private (Admin/Mentor)
 */
export const getBatchById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const batch = await prisma.batch.findUnique({
      where: { id: id as string },
      include: {
        course: {
          select: { title: true, id: true },
        },
        enrollments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { enrolledAt: "desc" },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!batch) {
      throw new AppError("Batch tidak ditemukan.", 404);
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  },
);

/**
 * @desc    Update a batch
 * @route   PUT /api/v1/batches/:id
 * @access  Private (Admin/Mentor)
 */
export const updateBatch = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, startDate, endDate, maxStudents, isActive } = req.body;

  const batch = await prisma.batch.findUnique({
    where: { id: id as string },
    include: { course: true },
  });

  if (!batch) throw new AppError("Batch tidak ditemukan.", 404);

  if (req.user!.role === "mentor" && batch.course.createdBy !== req.user!.id) {
    throw new AppError("Tidak memiliki akses untuk mengubah batch ini.", 403);
  }

  const updated = await prisma.batch.update({
    where: { id: id as string },
    data: {
      name,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      maxStudents: maxStudents !== undefined ? maxStudents : undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    },
  });

  res.status(200).json({
    success: true,
    message: "Batch berhasil diupdate.",
    data: updated,
  });
});

/**
 * @desc    Delete a batch
 * @route   DELETE /api/v1/batches/:id
 * @access  Private (Admin)
 */
export const deleteBatch = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const batch = await prisma.batch.findUnique({
    where: { id: id as string },
    include: { _count: { select: { enrollments: true } } },
  });

  if (!batch) throw new AppError("Batch tidak ditemukan.", 404);

  if (batch._count.enrollments > 0) {
    throw new AppError(
      "Batch tidak bisa dihapus karena masih ada siswa terdaftar.",
      400,
    );
  }

  await prisma.batch.delete({ where: { id: id as string } });

  res.status(200).json({
    success: true,
    message: "Batch berhasil dihapus.",
  });
});

/**
 * @desc    Assign student to a batch
 * @route   POST /api/v1/batches/:id/assign
 * @access  Private (Admin/Mentor)
 */
export const assignStudentToBatch = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { enrollmentId } = req.body;

    if (!enrollmentId) {
      throw new AppError("Enrollment ID wajib diisi.", 400);
    }

    const batch = await prisma.batch.findUnique({
      where: { id: id as string },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!batch) throw new AppError("Batch tidak ditemukan.", 404);

    // Check capacity
    if (batch.maxStudents && batch._count.enrollments >= batch.maxStudents) {
      throw new AppError("Batch sudah penuh.", 400);
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new AppError("Enrollment tidak ditemukan.", 404);
    }

    if (enrollment.courseId !== batch.courseId) {
      throw new AppError("Enrollment bukan untuk kursus batch ini.", 400);
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { batchId: id as string },
    });

    res.status(200).json({
      success: true,
      message: "Siswa berhasil ditambahkan ke batch.",
    });
  },
);
