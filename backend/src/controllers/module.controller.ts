import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Create new module
 * @route   POST /api/v1/modules
 * @access  Private (Admin)
 */
export const createModule = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, courseId, order } = req.body;

    if (!title || !courseId || order === undefined) {
      throw new AppError("Title, Course ID, dan Order wajib diisi.", 400);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId as string },
    });
    if (!course) throw new AppError("Kursus tidak ditemukan.", 404);

    // Check ownership if mentor
    if (req.user!.role === "mentor" && course.createdBy !== req.user!.id) {
      throw new AppError(
        "Tidak memiliki akses untuk menambahkan modul ke kursus ini.",
        403,
      );
    }

    const module = await prisma.module.create({
      data: {
        title,
        courseId,
        order,
      },
    });

    res.status(201).json({
      success: true,
      data: module,
    });
  },
);

/**
 * @desc    Update module
 * @route   PUT /api/v1/modules/:id
 * @access  Private (Admin)
 */
export const updateModule = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, order } = req.body;

    const existingModule = await prisma.module.findUnique({
      where: { id: id as string },
      include: { course: true },
    });

    if (!existingModule) {
      throw new AppError("Modul tidak ditemukan.", 404);
    }

    // Check ownership if mentor
    if (
      req.user!.role === "mentor" &&
      existingModule.course.createdBy !== req.user!.id
    ) {
      throw new AppError("Tidak memiliki akses untuk mengubah modul ini.", 403);
    }

    const module = await prisma.module.update({
      where: { id: id as string },
      data: {
        title,
        order,
      },
    });

    res.status(200).json({
      success: true,
      data: module,
    });
  },
);

/**
 * @desc    Delete module
 * @route   DELETE /api/v1/modules/:id
 * @access  Private (Admin)
 */
export const deleteModule = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingModule = await prisma.module.findUnique({
      where: { id: id as string },
      include: { course: true },
    });

    if (!existingModule) {
      throw new AppError("Modul tidak ditemukan.", 404);
    }

    // Check ownership if mentor
    if (
      req.user!.role === "mentor" &&
      existingModule.course.createdBy !== req.user!.id
    ) {
      throw new AppError(
        "Tidak memiliki akses untuk menghapus modul ini.",
        403,
      );
    }

    await prisma.module.delete({
      where: { id: id as string },
    });

    res.status(200).json({
      success: true,
      message: "Module berhasil dihapus.",
    });
  },
);
