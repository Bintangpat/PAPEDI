import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Prisma } from "@prisma/client";

/**
 * @desc    Get all users (with pagination, search, filter)
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, role } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { email: { contains: String(search), mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role as any;
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            createdCourses: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin)
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      enrollments: { include: { course: true } },
      createdCourses: true,
    },
  });

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user (Role, verification)
 * @route   PATCH /api/v1/users/:id
 * @access  Private (Admin)
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { role, isVerified, name, email, bio } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role,
      isVerified,
      name,
      email,
      bio,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "Data user berhasil diperbarui",
    data: updatedUser,
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  // Prevent deleting self
  if (req.user?.id === id) {
    throw new AppError("Tidak dapat menghapus akun sendiri saat login", 400);
  }

  await prisma.user.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: "User berhasil dihapus",
  });
});
