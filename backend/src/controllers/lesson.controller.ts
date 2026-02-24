import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { LessonType } from "@prisma/client";

/**
 * @desc    Create new lesson
 * @route   POST /api/v1/lessons
 * @access  Private (Admin)
 */
export const createLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, moduleId, type, content, videoUrl, order } = req.body;

    if (!title || !moduleId || order === undefined) {
      throw new AppError("Title, Module ID, dan Order wajib diisi.", 400);
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId as string },
      include: { course: true },
    });
    if (!module) throw new AppError("Module tidak ditemukan.", 404);

    // Check ownership if mentor
    if (
      req.user!.role === "mentor" &&
      module.course.createdBy !== req.user!.id
    ) {
      throw new AppError(
        "Tidak memiliki akses untuk menambahkan lesson ke modul ini.",
        403,
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        moduleId,
        type: type as LessonType,
        content,
        videoUrl,
        order,
      },
    });

    res.status(201).json({
      success: true,
      data: lesson,
    });
  },
);

/**
 * @desc    Update lesson
 * @route   PUT /api/v1/lessons/:id
 * @access  Private (Admin)
 */
export const updateLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, type, content, videoUrl, order } = req.body;

    const existingLesson = await prisma.lesson.findUnique({
      where: { id: id as string },
      include: { module: { include: { course: true } } },
    });

    if (!existingLesson) {
      throw new AppError("Lesson tidak ditemukan.", 404);
    }

    // Check ownership if mentor
    if (
      req.user!.role === "mentor" &&
      existingLesson.module.course.createdBy !== req.user!.id
    ) {
      throw new AppError(
        "Tidak memiliki akses untuk mengubah lesson ini.",
        403,
      );
    }

    const lesson = await prisma.lesson.update({
      where: { id: id as string },
      data: {
        title,
        type: type as LessonType,
        content,
        videoUrl,
        order,
      },
    });

    res.status(200).json({
      success: true,
      data: lesson,
    });
  },
);

/**
 * @desc    Delete lesson
 * @route   DELETE /api/v1/lessons/:id
 * @access  Private (Admin)
 */
export const deleteLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingLesson = await prisma.lesson.findUnique({
      where: { id: id as string },
      include: { module: { include: { course: true } } },
    });

    if (!existingLesson) {
      throw new AppError("Lesson tidak ditemukan.", 404);
    }

    // Check ownership if mentor
    if (
      req.user!.role === "mentor" &&
      existingLesson.module.course.createdBy !== req.user!.id
    ) {
      throw new AppError(
        "Tidak memiliki akses untuk menghapus lesson ini.",
        403,
      );
    }

    await prisma.lesson.delete({
      where: { id: id as string },
    });

    res.status(200).json({
      success: true,
      message: "Lesson berhasil dihapus.",
    });
  },
);

/**
 * @desc    Get lesson by ID
 * @route   GET /api/v1/lessons/:id
 * @access  Private (Enrolled Student)
 */
export const getLessonById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: id as string },
      include: {
        module: {
          select: { courseId: true },
        },
      },
    });

    if (!lesson) {
      throw new AppError("Lesson tidak ditemukan.", 404);
    }

    // Check enrollment if user is student
    if (req.user!.role === "student") {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.user!.id,
            courseId: lesson.module.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new AppError("Anda belum terdaftar di kursus ini.", 403);
      }
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  },
);
