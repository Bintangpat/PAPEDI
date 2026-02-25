import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get dashboard summary stats
 * @route   GET /api/v1/student/dashboard/summary
 * @access  Private (Student)
 */
export const getDashboardSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Get enrollments with module progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        moduleProgress: {
          select: { status: true },
        },
      },
    });

    const totalCourses = enrollments.length;

    // Completed courses: enrollment status = COMPLETED
    const completedCourses = enrollments.filter(
      (e) => e.status === "COMPLETED",
    ).length;

    // Average quiz score (best scores)
    const quizStats = await prisma.quizAttempt.aggregate({
      where: { userId },
      _avg: { score: true },
    });

    // Approved projects count
    const approvedProjects = await prisma.projectSubmission.count({
      where: { userId, status: "LULUS" },
    });

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        completedCourses,
        avgQuizScore: Math.round((quizStats._avg.score ?? 0) * 100) / 100,
        approvedProjects,
      },
    });
  },
);

/**
 * @desc    Get progress per course
 * @route   GET /api/v1/student/dashboard/progress
 * @access  Private (Student)
 */
export const getDashboardProgress = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          },
        },
        moduleProgress: {
          select: {
            status: true,
            isPassed: true,
            averageQuizScore: true,
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
      orderBy: { enrolledAt: "desc" },
    });

    const progressData = enrollments.map((enrollment) => {
      const totalModules = enrollment.moduleProgress.length;
      const completedModules = enrollment.moduleProgress.filter(
        (mp) => mp.status === "COMPLETED",
      ).length;
      const progress =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

      return {
        courseId: enrollment.course.id,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        progress,
        totalModules,
        completedModules,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        finalScore: enrollment.finalScore,
        moduleProgress: enrollment.moduleProgress,
      };
    });

    res.status(200).json({
      success: true,
      data: progressData,
    });
  },
);

/**
 * @desc    Get recent activity (paginated)
 * @route   GET /api/v1/student/dashboard/activity
 * @access  Private (Student)
 */
export const getDashboardActivity = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Fetch recent quiz attempts, project submissions, and enrollments
    const [quizAttempts, submissions, enrollments] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId },
        include: {
          quiz: {
            include: {
              module: {
                include: {
                  course: { select: { title: true } },
                },
              },
            },
          },
        },
        orderBy: { attemptedAt: "desc" },
        take: 50,
      }),
      prisma.projectSubmission.findMany({
        where: { userId },
        include: {
          course: { select: { title: true } },
          project: { select: { title: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 50,
      }),
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: { select: { title: true } },
        },
        orderBy: { enrolledAt: "desc" },
        take: 50,
      }),
    ]);

    // Normalize into activity items
    interface ActivityItem {
      type: string;
      title: string;
      courseName: string;
      date: Date;
      status?: string;
      score?: number;
    }

    const activities: ActivityItem[] = [];

    for (const qa of quizAttempts) {
      activities.push({
        type: "quiz",
        title: `Quiz: ${qa.quiz.module.title}`,
        courseName: qa.quiz.module.course.title,
        date: qa.attemptedAt,
        status: qa.passed ? "PASSED" : "FAILED",
        score: qa.score,
      });
    }

    for (const sub of submissions) {
      activities.push({
        type: "project",
        title: `Project: ${sub.project?.title || "Submission"}`,
        courseName: sub.course.title,
        date: sub.submittedAt,
        status: sub.status,
        score: sub.score ?? undefined,
      });
    }

    for (const enr of enrollments) {
      activities.push({
        type: "enrollment",
        title: `Enrolled: ${enr.course.title}`,
        courseName: enr.course.title,
        date: enr.enrolledAt,
        status: enr.status,
      });
    }

    // Sort by date descending and paginate
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    const total = activities.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedActivities = activities.slice(start, start + limit);

    res.status(200).json({
      success: true,
      data: paginatedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  },
);

/**
 * @desc    Get student certificates
 * @route   GET /api/v1/student/dashboard/certificates
 * @access  Private (Student)
 */
export const getDashboardCertificates = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: certificates,
    });
  },
);

/**
 * @desc    Get course recommendations (not yet enrolled, prioritize same category)
 * @route   GET /api/v1/student/dashboard/recommendations
 * @access  Private (Student)
 */
export const getDashboardRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Get enrolled course IDs and their categories
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: {
        courseId: true,
        course: { select: { category: true } },
      },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const enrolledCategories = enrollments.map((e) => e.course.category);

    // Get published courses not yet enrolled, excluding soft-deleted
    const recommendations = await prisma.course.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        id: { notIn: enrolledCourseIds.length > 0 ? enrolledCourseIds : [] },
      },
      include: {
        creator: { select: { name: true } },
        _count: { select: { modules: true, enrollments: true } },
      },
      take: 8,
    });

    // Sort: same category first
    const sorted = recommendations.sort((a, b) => {
      const aMatch = enrolledCategories.includes(a.category) ? 0 : 1;
      const bMatch = enrolledCategories.includes(b.category) ? 0 : 1;
      return aMatch - bMatch;
    });

    res.status(200).json({
      success: true,
      data: sorted.slice(0, 4),
    });
  },
);
