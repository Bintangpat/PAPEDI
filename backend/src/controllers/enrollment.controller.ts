import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Enroll in a course
 * @route   POST /api/v1/enrollments/:courseId
 * @access  Private (Student)
 */
export const enrollCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params as { courseId: string };
    const userId = req.user!.id;

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId, deletedAt: null },
      include: {
        modules: {
          orderBy: { order: "asc" },
          select: { id: true },
        },
      },
    });

    if (!course) {
      throw new AppError("Kursus tidak ditemukan.", 404);
    }

    if (!course.isPublished) {
      throw new AppError("Kursus ini belum dipublikasikan.", 400);
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new AppError("Anda sudah terdaftar di kursus ini.", 400);
    }

    // Create enrollment + ModuleProgress entries in a transaction
    const enrollment = await prisma.$transaction(async (tx) => {
      const newEnrollment = await tx.enrollment.create({
        data: {
          userId,
          courseId,
          status: "ACTIVE",
        },
        include: {
          course: {
            select: {
              title: true,
              thumbnail: true,
            },
          },
        },
      });

      // Create ModuleProgress for each module (all IN_PROGRESS per PRD — lessons always accessible)
      if (course.modules.length > 0) {
        await tx.moduleProgress.createMany({
          data: course.modules.map((mod) => ({
            enrollmentId: newEnrollment.id,
            moduleId: mod.id,
            status: "IN_PROGRESS" as const,
          })),
        });
      }

      return newEnrollment;
    });

    res.status(201).json({
      success: true,
      message: "Berhasil mendaftar kursus.",
      data: enrollment,
    });
  },
);

/**
 * @desc    Get my enrollments
 * @route   GET /api/v1/enrollments/me
 * @access  Private (Student)
 */
export const getMyEnrollments = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            creator: {
              select: { name: true },
            },
            _count: {
              select: { modules: true },
            },
          },
        },
        moduleProgress: {
          select: {
            status: true,
            isPassed: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Enrich with progress percentage
    const enriched = enrollments.map((enrollment) => {
      const totalModules = enrollment.moduleProgress.length;
      const completedModules = enrollment.moduleProgress.filter(
        (mp) => mp.status === "COMPLETED",
      ).length;
      const progress =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

      return {
        ...enrollment,
        progress,
        completedModules,
        totalModules,
      };
    });

    res.status(200).json({
      success: true,
      data: enriched,
    });
  },
);

/**
 * @desc    Check enrollment status
 * @route   GET /api/v1/enrollments/:courseId/check
 * @access  Private (Student)
 */
export const checkEnrollment = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params as { courseId: string };
    const userId = req.user!.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        moduleProgress: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
          orderBy: {
            module: { order: "asc" },
          },
        },
      },
    });

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        isEnrolled: false,
        data: null,
      });
    }

    // Auto-heal: If user is still ACTIVE or FAILED but might have completed everything, re-evaluate.
    if (enrollment.status === "ACTIVE" || enrollment.status === "FAILED") {
      await evaluateEnrollmentStatus(enrollment.id, userId, courseId);
      // Refetch after possible status change
      const refreshedEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollment.id },
      });
      if (refreshedEnrollment) {
        enrollment.status = refreshedEnrollment.status;
        enrollment.finalScore = refreshedEnrollment.finalScore;
        enrollment.isEligibleCert = refreshedEnrollment.isEligibleCert;
      }
    }

    // Fetch passed projects
    const passedProjects = await prisma.projectSubmission.findMany({
      where: {
        userId,
        courseId,
        status: "LULUS",
      },
      select: { projectId: true },
    });

    const completedProjects = passedProjects
      .map((p) => p.projectId)
      .filter((id): id is string => !!id);

    res.status(200).json({
      success: true,
      isEnrolled: true,
      data: {
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        status: enrollment.status,
        finalScore: enrollment.finalScore,
        isEligibleCert: enrollment.isEligibleCert,
        enrolledAt: enrollment.enrolledAt,
        // Legacy arrays (still accessible for backward compat)
        completedLessons: enrollment.completedLessons,
        completedQuizzes: enrollment.completedQuizzes,
        // New structured progress
        moduleProgress: enrollment.moduleProgress,
        completedProjects,
      },
    });
  },
);

/**
 * @desc    Mark lesson as complete
 * @route   POST /api/v1/enrollments/:courseId/lessons/:lessonId/complete
 * @access  Private (Student)
 */
export const markLessonComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId, lessonId } = req.params as {
      courseId: string;
      lessonId: string;
    };
    const userId = req.user!.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new AppError("Anda belum terdaftar di kursus ini.", 403);
    }

    // Verify the lesson exists and get its module
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            lessons: { select: { id: true } },
            quiz: { select: { id: true } },
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError("Materi tidak ditemukan.", 404);
    }

    // Update legacy array (backward compatibility)
    const completedLessons = enrollment.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          completedLessons: {
            push: lessonId,
          },
        },
      });
    }

    // Evaluate module completion after marking lesson
    await evaluateModuleCompletion(
      enrollment.id,
      lesson.module.id,
      userId,
      courseId,
    );

    res.status(200).json({
      success: true,
      message: "Materi ditandai selesai.",
    });
  },
);

/**
 * Helper: Evaluate if a module is completed after a progress action
 * A module is COMPLETED when all lessons are done AND quiz is passed (if exists)
 */
async function evaluateModuleCompletion(
  enrollmentId: string,
  moduleId: string,
  userId: string,
  courseId: string,
) {
  // Get module content
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lessons: { select: { id: true } },
      quiz: { select: { id: true, passingScore: true } },
    },
  });

  if (!mod) return;

  // Get enrollment with legacy arrays
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });

  if (!enrollment) return;

  // Check all lessons completed
  const lessonIds = mod.lessons.map((l) => l.id);
  const allLessonsCompleted = lessonIds.every((id) =>
    enrollment.completedLessons.includes(id),
  );

  // Check quiz passed (best score)
  let quizPassed = true; // No quiz = auto pass
  let bestQuizScore: number | null = null;

  if (mod.quiz) {
    const bestAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId: mod.quiz.id,
        passed: true,
      },
      orderBy: { score: "desc" },
    });

    quizPassed = !!bestAttempt;
    bestQuizScore = bestAttempt?.score ?? null;
  }

  const isCompleted = allLessonsCompleted && quizPassed;

  // Upsert ModuleProgress
  await prisma.moduleProgress.upsert({
    where: {
      enrollmentId_moduleId: {
        enrollmentId,
        moduleId,
      },
    },
    create: {
      enrollmentId,
      moduleId,
      status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      isPassed: isCompleted,
      averageQuizScore: bestQuizScore,
    },
    update: {
      status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      isPassed: isCompleted,
      averageQuizScore: bestQuizScore,
    },
  });

  // If module completed, re-evaluate enrollment status
  if (isCompleted) {
    await evaluateEnrollmentStatus(enrollmentId, userId, courseId);
  }
}

/**
 * Helper: Evaluate if all modules are completed and update enrollment status
 */
async function evaluateEnrollmentStatus(
  enrollmentId: string,
  userId: string,
  courseId: string,
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      moduleProgress: true,
      course: {
        include: {
          modules: {
            include: {
              project: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!enrollment) return;

  const completedModuleIds = enrollment.moduleProgress
    .filter((mp) => mp.status === "COMPLETED")
    .map((mp) => mp.moduleId);

  const allModulesCompleted =
    enrollment.course.modules.length === 0 ||
    enrollment.course.modules.every((mod) =>
      completedModuleIds.includes(mod.id),
    );

  if (!allModulesCompleted) return;

  // Check all projects passed
  const projectIds = enrollment.course.modules
    .flatMap((m) => (m.project ? [m.project.id] : []))
    .filter(Boolean);

  let allProjectsPassed = true;
  if (projectIds.length > 0) {
    const passedCount = await prisma.projectSubmission.count({
      where: {
        userId,
        courseId,
        status: "LULUS",
        projectId: { in: projectIds },
      },
    });
    allProjectsPassed = passedCount >= projectIds.length;
  }

  if (allModulesCompleted && allProjectsPassed) {
    // Calculate final score
    const finalScore = await calculateFinalScore(userId, courseId);
    const isEligible = finalScore !== null && finalScore >= 80;

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: isEligible ? "COMPLETED" : "FAILED",
        finalScore,
        isEligibleCert: isEligible,
      },
    });
  }
}

/**
 * Helper: Calculate final score using weighted formula
 * FinalScore = (WeightedAverageQuizScore × 0.4) + (ProjectScore × 0.6)
 */
async function calculateFinalScore(
  userId: string,
  courseId: string,
): Promise<number | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          quiz: { select: { id: true } },
          project: { select: { id: true } },
        },
      },
    },
  });

  if (!course) return null;

  // Calculate weighted average quiz score (best scores only)
  let totalQuizScore = 0;
  let quizCount = 0;

  for (const mod of course.modules) {
    if (mod.quiz) {
      const best = await prisma.quizAttempt.findFirst({
        where: { userId, quizId: mod.quiz.id },
        orderBy: { score: "desc" },
      });

      if (best) {
        totalQuizScore += best.score;
      }
      quizCount++;
    }
  }

  const avgQuizScore = quizCount > 0 ? totalQuizScore / quizCount : 0;

  // Calculate project score (average of all project scores)
  const projectIds = course.modules
    .flatMap((m) => (m.project ? [m.project.id] : []))
    .filter(Boolean);

  let avgProjectScore = 0;
  if (projectIds.length > 0) {
    const submissions = await prisma.projectSubmission.findMany({
      where: {
        userId,
        courseId,
        status: "LULUS",
        projectId: { in: projectIds },
        score: { not: null },
      },
      select: { score: true },
    });

    if (submissions.length > 0) {
      avgProjectScore =
        submissions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
        submissions.length;
    }
  }

  const hasQuizzes = course.modules.some((m) => m.quiz !== null);
  const quizWeight = hasQuizzes ? (projectIds.length > 0 ? 0.4 : 1.0) : 0;

  const projectWeight = projectIds.length > 0 ? (hasQuizzes ? 0.6 : 1.0) : 0;

  let finalScore = 0;

  if (!hasQuizzes && projectIds.length === 0) {
    // If no quizzes and no projects exist, completion alone awards 100
    finalScore = 100;
  } else {
    // Final formula dynamically weighted
    finalScore = avgQuizScore * quizWeight + avgProjectScore * projectWeight;
  }

  return Math.round(finalScore * 100) / 100;
}

// Export helpers for use in other controllers
export {
  evaluateModuleCompletion,
  evaluateEnrollmentStatus,
  calculateFinalScore,
};
