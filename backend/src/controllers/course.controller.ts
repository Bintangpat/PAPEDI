import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CourseLevel, CourseCategory } from "@prisma/client";

/**
 * @desc    Create new course
 * @route   POST /api/v1/courses
 * @access  Private (Mentor, Admin)
 */
export const createCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, category, level, thumbnail } = req.body;

    if (!title || !description || !category || !level) {
      throw new AppError("Mohon lengkapi semua field wajib.", 400);
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category: category as CourseCategory,
        level: level as CourseLevel,
        thumbnail,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  },
);

/**
 * @desc    Get courses created by current user (Mentor)
 * @route   GET /api/v1/courses/me
 * @access  Private (Mentor, Admin)
 */
export const getMyCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const courses = await prisma.course.findMany({
      where: { createdBy: req.user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { modules: true, enrollments: true } },
      },
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  },
);

/**
 * @desc    Get all courses (Public) — hanya yang sudah published
 * @route   GET /api/v1/courses
 * @access  Public
 */
export const getAllCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 12,
      sort = "date_desc",
      category,
      level,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "date_asc":
        orderBy = { createdAt: "asc" };
        break;
      case "date_desc":
        orderBy = { createdAt: "desc" };
        break;
      case "alpha_asc":
        orderBy = { title: "asc" };
        break;
      case "alpha_desc":
        orderBy = { title: "desc" };
        break;
    }

    // Filtering — PUBLIC endpoint selalu hanya published
    const where: any = { isPublished: true };
    if (category) where.category = category as string;
    if (level) where.level = level as string;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          creator: { select: { name: true } },
          _count: { select: { modules: true, enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: courses,
    });
  },
);

/**
 * @desc    Get all courses (Admin) — published & draft
 * @route   GET /api/v1/courses/admin
 * @access  Private (Admin)
 */
export const getAllCoursesAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 25,
      sort = "date_desc",
      category,
      level,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "date_asc":
        orderBy = { createdAt: "asc" };
        break;
      case "date_desc":
        orderBy = { createdAt: "desc" };
        break;
      case "alpha_asc":
        orderBy = { title: "asc" };
        break;
      case "alpha_desc":
        orderBy = { title: "desc" };
        break;
    }

    // Filtering — ADMIN dapat lihat semua kursus (published & draft)
    const where: any = {};
    if (category) where.category = category as string;
    if (level) where.level = level as string;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          creator: { select: { name: true } },
          _count: { select: { modules: true, enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: courses,
    });
  },
);

/**
 * @desc    Get course by ID
 * @route   GET /api/v1/courses/:id
 * @access  Public
 */
export const getCourseById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
              },
            },
            quiz: { select: { id: true, passingScore: true } },
            project: { select: { id: true, title: true, description: true } },
          },
        },
        creator: { select: { name: true, avatar: true, bio: true } },
      },
    });

    if (!course) {
      throw new AppError("Kursus tidak ditemukan.", 404);
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  },
);

/**
 * @desc    Update course
 * @route   PUT /api/v1/courses/:id
 * @access  Private (Mentor, Admin)
 */
export const updateCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { title, description, category, level, thumbnail, isPublished } =
      req.body;

    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new AppError("Kursus tidak ditemukan.", 404);
    }

    if (req.user!.role === "mentor" && course.createdBy !== req.user!.id) {
      throw new AppError(
        "Tidak memiliki akses untuk mengubah kursus ini.",
        403,
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && {
          category: String(category) as CourseCategory,
        }),
        ...(level !== undefined && { level: String(level) as CourseLevel }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  },
);

/**
 * @desc    Delete course
 * @route   DELETE /api/v1/courses/:id
 * @access  Private (Mentor, Admin)
 */
export const deleteCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new AppError("Kursus tidak ditemukan.", 404);
    }

    if (req.user!.role === "mentor" && course.createdBy !== req.user!.id) {
      throw new AppError(
        "Tidak memiliki akses untuk menghapus kursus ini.",
        403,
      );
    }

    await prisma.course.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Kursus berhasil dihapus.",
    });
  },
);
