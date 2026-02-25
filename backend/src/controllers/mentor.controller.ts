import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SubmissionStatus } from "@prisma/client";
import { evaluateModuleCompletion } from "./enrollment.controller.js";

/**
 * @desc    Get Mentor Dashboard Stats
 * @route   GET /api/v1/mentor/stats
 * @access  Private (Mentor)
 */
export const getMentorStats = asyncHandler(
  async (req: Request, res: Response) => {
    const mentorId = req.user!.id;

    // 1. Count Pending Projects for courses created by this mentor
    const pendingProjects = await prisma.projectSubmission.count({
      where: {
        course: {
          createdBy: mentorId,
        },
        status: "PENDING",
      },
    });

    // 2. Count Total Students enrolled in mentor's courses
    // We get all courses by mentor, then count enrollments
    const totalStudents = await prisma.enrollment.count({
      where: {
        course: {
          createdBy: mentorId,
        },
      },
    });

    // 3. Count Total Courses created by mentor
    const totalCourses = await prisma.course.count({
      where: {
        createdBy: mentorId,
        deletedAt: null,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        pendingProjects,
        totalStudents,
        totalCourses,
      },
    });
  },
);

/**
 * @desc    Get Pending Submissions
 * @route   GET /api/v1/mentor/submissions
 * @access  Private (Mentor)
 */
export const getSubmissions = asyncHandler(
  async (req: Request, res: Response) => {
    const mentorId = req.user!.id;
    const { status } = req.query; // Optional filter

    const whereClause: any = {
      course: {
        createdBy: mentorId,
      },
    };

    if (status) {
      whereClause.status = status as SubmissionStatus;
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  },
);

/**
 * @desc    Grade Submission
 * @route   POST /api/v1/mentor/submissions/:id/grade
 * @access  Private (Mentor)
 */
export const gradeSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, feedback, score } = req.body;
    const mentorId = req.user!.id;

    if (!status || !feedback) {
      throw new AppError("Status dan Feedback wajib diisi.", 400);
    }

    const submission = await prisma.projectSubmission.findFirst({
      where: {
        id: id as string,
        course: {
          createdBy: mentorId,
        },
      },
      include: {
        project: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!submission) {
      throw new AppError(
        "Submission tidak ditemukan atau Anda tidak berhak menilai.",
        404,
      );
    }

    // Calculate isPassed based on project's passingScore
    const passingScore = submission.project?.passingScore ?? 80;
    const numericScore = typeof score === "number" ? score : null;
    const isPassed =
      status === "LULUS" && numericScore !== null
        ? numericScore >= passingScore
        : status === "LULUS";

    const updatedSubmission = await prisma.projectSubmission.update({
      where: { id: id as string },
      data: {
        status: status as SubmissionStatus,
        feedback,
        score: numericScore,
        isPassed,
        reviewedBy: mentorId,
      },
    });

    // If passed, evaluate module completion and enrollment status
    if (isPassed && submission.project) {
      const moduleId = submission.project.module.id;
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: submission.userId,
            courseId: submission.courseId,
          },
        },
      });

      if (enrollment) {
        await evaluateModuleCompletion(
          enrollment.id,
          moduleId,
          submission.userId,
          submission.courseId,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Submission berhasil dinilai.",
      data: updatedSubmission,
    });
  },
);
