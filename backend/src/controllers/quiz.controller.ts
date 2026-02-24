import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get quiz by Module ID (Student)
 * @route   GET /api/v1/modules/:moduleId/quiz
 * @access  Private (Student/Enrolled)
 */
export const getQuizByModuleId = asyncHandler(
  async (req: Request, res: Response) => {
    const { moduleId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { moduleId: moduleId as string },
      include: {
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError("Quiz tidak ditemukan.", 404);
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  },
);

/**
 * @desc    Get Quiz by ID (Student)
 * @route   GET /api/v1/quiz/:id
 * @access  Private (Student)
 */
export const getQuizById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: id as string },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });

  if (!quiz) {
    throw new AppError("Quiz tidak ditemukan.", 404);
  }

  res.status(200).json({
    success: true,
    data: quiz,
  });
});

/**
 * @desc    Get full quiz for editing (Mentor)
 * @route   GET /api/v1/quiz/module/:moduleId/editor
 * @access  Private (Mentor/Admin)
 */
export const getQuizForEditor = asyncHandler(
  async (req: Request, res: Response) => {
    const { moduleId } = req.params;
    const userId = req.user!.id; // For ownership check if needed, though middleware handles basic role

    const quiz = await prisma.quiz.findUnique({
      where: { moduleId: moduleId as string },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    // If quiz doesn't exist, return null data instead of 404 to allow creating
    // Or return 404 and handle in frontend. Let's return null data.

    if (!quiz) {
      return res.status(200).json({ success: true, data: null });
    }

    // Ownership check (optional but good practice)
    // For now assuming route protection is enough or we rely on the implementation plan

    res.status(200).json({
      success: true,
      data: quiz,
    });
  },
);

/**
 * @desc    Create/Update Quiz (Admin)
 * @route   POST /api/v1/quiz
 * @access  Private (Admin)
 */
export const upsertQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId, passingScore, questions } = req.body;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  if (!moduleId || !questions || !Array.isArray(questions)) {
    throw new AppError("Module ID dan Questions wajib diisi.", 400);
  }

  // Check ownership if not admin
  if (userRole !== "admin") {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) throw new AppError("Module tidak ditemukan.", 404);

    if (module.course.createdBy !== userId) {
      throw new AppError(
        "Anda tidak memiliki akses untuk mengubah quiz ini.",
        403,
      );
    }
  }

  // Transaction to handle quiz and questions
  const quiz = await prisma.$transaction(async (tx) => {
    // 1. Upsert Quiz
    const newQuiz = await tx.quiz.upsert({
      where: { moduleId },
      create: { moduleId, passingScore: passingScore || 80 },
      update: { passingScore: passingScore || 80 },
    });

    // 2. Delete existing questions (simple replacement strategy)
    await tx.quizQuestion.deleteMany({
      where: { quizId: newQuiz.id },
    });

    // 3. Insert new questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await tx.quizQuestion.create({
        data: {
          quizId: newQuiz.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          order: i + 1,
        },
      });
    }

    return newQuiz;
  });

  res.status(200).json({
    success: true,
    message: "Quiz berhasil disimpan.",
    data: quiz,
  });
});

/**
 * @desc    Submit Quiz Answer (Student)
 * @route   POST /api/v1/quiz/:id/submit
 * @access  Private (Student)
 */
export const submitQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // Quiz ID
  const { answers } = req.body; // Array of selected indices

  if (!answers || !Array.isArray(answers)) {
    throw new AppError("Jawaban wajib diisi.", 400);
  }

  const quiz: any = await prisma.quiz.findUnique({
    where: { id: id as string },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!quiz) throw new AppError("Quiz tidak ditemukan.", 404);

  if (answers.length !== quiz.questions.length) {
    throw new AppError("Jumlah jawaban tidak sesuai.", 400);
  }

  // Calculate Score
  let correctCount = 0;
  quiz.questions.forEach((q: any, index: number) => {
    if (answers[index] === q.correctAnswer) {
      correctCount++;
    }
  });

  const score = (correctCount / quiz.questions.length) * 100;
  const passed = score >= quiz.passingScore;

  // Record Attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: req.user!.id,
      quizId: id as string,
      answers,
      score,
      passed,
    },
  });

  // If passed, update enrollment progress
  if (passed) {
    const moduleId = quiz.moduleId;
    // Find enrollment via courseId is tricky because we only have quizId -> moduleId -> courseId
    // We need to fetch courseId from quiz first
    const quizWithCourse = await prisma.quiz.findUnique({
      where: { id: id as string },
      include: { module: true },
    });

    if (quizWithCourse) {
      const courseId = quizWithCourse.module.courseId;
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user!.id, courseId } },
      });

      if (enrollment && !enrollment.completedQuizzes.includes(id as string)) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            completedQuizzes: { push: id as string },
          },
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      score,
      passed,
      attempt,
    },
  });
});
