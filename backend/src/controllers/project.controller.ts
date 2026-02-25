import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { evaluateModuleCompletion } from "./enrollment.controller.js";

/**
 * @desc    Submit Final Project
 * @route   POST /api/v1/projects
 * @access  Private (Student)
 */
export const submitProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId, projectId, githubUrl, demoUrl } = req.body;

    if (!courseId || !projectId || !githubUrl) {
      throw new AppError(
        "Course ID, Project ID, dan GitHub URL wajib diisi.",
        400,
      );
    }

    // Check if valid project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new AppError("Project tidak ditemukan", 404);

    // Check if already submitted
    const existingSubmission = await prisma.projectSubmission.findFirst({
      where: {
        userId: req.user!.id,
        projectId: projectId, // Scope by project ID
      },
    });

    let submission;

    if (existingSubmission) {
      // Update
      submission = await prisma.projectSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          githubUrl,
          demoUrl,
          status: "PENDING", // Reset status on resubmission
          feedback: null, // Clear old feedback
        },
      });
    } else {
      // Create new
      submission = await prisma.projectSubmission.create({
        data: {
          userId: req.user!.id,
          courseId,
          projectId,
          githubUrl,
          demoUrl,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Project berhasil disubmit.",
      data: submission,
    });
  },
);

/**
 * @desc    Get My Submission for a Course
 * @route   GET /api/v1/projects/my?courseId=...
 * @access  Private (Student)
 */
export const getMySubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId, projectId } = req.query;

    if (!courseId) {
      throw new AppError("Course ID wajib diisi.", 400);
    }

    // If projectId is provided, filter by it.
    // If not, maybe return list? But frontend expects single object probably.
    // Let's assume frontend sends projectId if they want specific one.

    const where: any = {
      userId: req.user!.id,
      courseId: courseId as string,
    };

    if (projectId) {
      where.projectId = projectId as string;
    }

    // findFirst might return ANY submission if projectId not provided.
    // Ideally we should enforce projectId if we want specific.
    const submission = await prisma.projectSubmission.findFirst({
      where,
    });

    res.status(200).json({
      success: true,
      data: submission,
    });
  },
);

// ==========================================
// MENTOR / ADMIN: Project Definition Management
// ==========================================

/**
 * @desc    Create Project Definition for a Module
 * @route   POST /api/v1/projects
 * @access  Private (Mentor/Admin)
 */
export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { moduleId, title, description, deadline, passingScore } = req.body;

    if (!moduleId || !title || !description) {
      throw new AppError("Module ID, Title, dan Description wajib diisi.", 400);
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new AppError("Module tidak ditemukan.", 404);
    }

    // Authorization check
    if (
      req.user!.role === "mentor" &&
      module.course.createdBy !== req.user!.id
    ) {
      throw new AppError(
        "Tidak memiliki akses untuk menambahkan project di modul ini.",
        403,
      );
    }

    // Check if project already exists for this module
    const existingProject = await prisma.project.findUnique({
      where: { moduleId },
    });

    if (existingProject) {
      throw new AppError("Project sudah ada untuk modul ini.", 400);
    }

    const project = await prisma.project.create({
      data: {
        moduleId,
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        passingScore: passingScore ?? 80,
      },
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  },
);

/**
 * @desc    Update Project Definition
 * @route   PUT /api/v1/projects/:id
 * @access  Private (Mentor/Admin)
 */
export const updateProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { title, description, deadline, passingScore } = req.body;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!project) {
      throw new AppError("Project tidak ditemukan.", 404);
    }

    // Authorization check
    if (
      req.user!.role === "mentor" &&
      (project as any).module.course.createdBy !== req.user!.id
    ) {
      throw new AppError(
        "Tidak memiliki akses untuk mengubah project ini.",
        403,
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : undefined,
        passingScore: passingScore !== undefined ? passingScore : undefined,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedProject,
    });
  },
);

/**
 * @desc    Delete Project Definition
 * @route   DELETE /api/v1/projects/:id
 * @access  Private (Mentor/Admin)
 */
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const project = await prisma.project.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!project) {
      throw new AppError("Project tidak ditemukan.", 404);
    }

    // Authorization check
    if (
      req.user!.role === "mentor" &&
      (project as any).module.course.createdBy !== req.user!.id
    ) {
      throw new AppError(
        "Tidak memiliki akses untuk menghapus project ini.",
        403,
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Project berhasil dihapus.",
    });
  },
);

/**
 * @desc    Get Project Definition by ID
 * @route   GET /api/v1/projects/:id
 * @access  Public/Private
 */
export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new AppError("Project tidak ditemukan.", 404);
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  },
);

/**
 * @desc    Get All Submissions for a Project (Mentor)
 * @route   GET /api/v1/projects/:id/submissions
 * @access  Private (Mentor/Admin)
 */
export const getProjectSubmissions = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const project = await prisma.project.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!project) {
      throw new AppError("Project tidak ditemukan.", 404);
    }

    // Authorization check
    if (
      req.user!.role === "mentor" &&
      (project as any).module.course.createdBy !== req.user!.id
    ) {
      throw new AppError(
        "Tidak memiliki akses untuk melihat submission project ini.",
        403,
      );
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: { projectId: id },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  },
);

/**
 * @desc    Grade Project Submission (Mentor)
 * @route   PUT /api/v1/projects/submissions/:submissionId
 * @access  Private (Mentor/Admin)
 */
export const gradeProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { submissionId } = req.params as { submissionId: string };
    const { status, feedback, score } = req.body;

    if (!["LULUS", "REVISI"].includes(status)) {
      throw new AppError("Status harus LULUS atau REVISI.", 400);
    }

    const submission = await prisma.projectSubmission.findUnique({
      where: { id: submissionId },
      include: {
        project: { include: { module: { include: { course: true } } } },
        course: true,
      },
    });

    if (!submission) {
      throw new AppError("Submission tidak ditemukan.", 404);
    }

    // Check ownership
    const course = await prisma.course.findUnique({
      where: { id: submission.courseId },
    });

    if (req.user!.role === "mentor" && course?.createdBy !== req.user!.id) {
      throw new AppError(
        "Tidak memiliki akses untuk menilai submission ini.",
        403,
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
      where: { id: submissionId },
      data: {
        status,
        feedback,
        score: numericScore,
        isPassed,
        reviewedBy: req.user!.id,
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
      data: updatedSubmission,
    });
  },
);

/**
 * @desc    Get Project Definition by Module ID
 * @route   GET /api/v1/projects/module/:moduleId
 * @access  Public/Private
 */
export const getProjectByModuleId = asyncHandler(
  async (req: Request, res: Response) => {
    const { moduleId } = req.params as { moduleId: string };

    const project = await prisma.project.findUnique({
      where: { moduleId },
    });

    if (!project) {
      // Return 404
      throw new AppError("Project tidak ditemukan for this module.", 404);
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  },
);
