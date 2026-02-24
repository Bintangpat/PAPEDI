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

    // Get enrollments with course module counts
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                quiz: true,
                project: true,
              },
            },
          },
        },
      },
    });

    const totalCourses = enrollments.length;

    // Calculate completed courses
    let completedCourses = 0;
    for (const enrollment of enrollments) {
      const totalModules = enrollment.course.modules.length;
      if (totalModules === 0) continue;

      let completedModules = 0;
      for (const mod of enrollment.course.modules) {
        let moduleCompleted = true;

        // Check quiz completion
        if (mod.quiz) {
          const quizPassed = enrollment.completedQuizzes.includes(mod.quiz.id);
          if (!quizPassed) moduleCompleted = false;
        }

        // Check project completion
        if (mod.project) {
          const projectApproved = await prisma.projectSubmission.findFirst({
            where: {
              userId,
              projectId: mod.project.id,
              status: "LULUS",
            },
          });
          if (!projectApproved) moduleCompleted = false;
        }

        // Check lessons completion
        const lessons = await prisma.lesson.findMany({
          where: { moduleId: mod.id },
          select: { id: true },
        });
        const allLessonsCompleted = lessons.every((l) =>
          enrollment.completedLessons.includes(l.id),
        );
        if (!allLessonsCompleted && lessons.length > 0) moduleCompleted = false;

        if (moduleCompleted) completedModules++;
      }

      if (completedModules === totalModules) completedCourses++;
    }

    // Average quiz score
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
            modules: {
              select: {
                id: true,
                quiz: { select: { id: true } },
                project: { select: { id: true } },
                lesson: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const progressData = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      const totalModules = course.modules.length;

      let completedModules = 0;
      for (const mod of course.modules) {
        let moduleCompleted = true;

        // Check lessons
        if (mod.lesson.length > 0) {
          const allLessonsCompleted = mod.lesson.every((l) =>
            enrollment.completedLessons.includes(l.id),
          );
          if (!allLessonsCompleted) moduleCompleted = false;
        }

        // Check quiz
        if (mod.quiz) {
          if (!enrollment.completedQuizzes.includes(mod.quiz.id)) {
            moduleCompleted = false;
          }
        }

        // Check project
        if (mod.project) {
          const projectApproved = await prisma.projectSubmission.findFirst({
            where: {
              userId,
              projectId: mod.project.id,
              status: "LULUS",
            },
          });
          if (!projectApproved) moduleCompleted = false;
        }

        if (moduleCompleted) completedModules++;
      }

      const progress =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

      progressData.push({
        courseId: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        progress,
        totalModules,
        completedModules,
        enrolledAt: enrollment.enrolledAt,
      });
    }

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

    // Gather activities from different sources
    const [quizAttempts, projectSubmissions, recentEnrollments] =
      await Promise.all([
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
    type ActivityItem = {
      type: string;
      title: string;
      courseName: string;
      date: Date;
      status: string;
    };

    const activities: ActivityItem[] = [];

    for (const qa of quizAttempts) {
      activities.push({
        type: "quiz",
        title: `Quiz: ${qa.quiz.module.title}`,
        courseName: qa.quiz.module.course.title,
        date: qa.attemptedAt,
        status: qa.passed ? "Lulus" : "Tidak Lulus",
      });
    }

    for (const ps of projectSubmissions) {
      activities.push({
        type: "project",
        title: `Project: ${ps.project?.title ?? "Submission"}`,
        courseName: ps.course.title,
        date: ps.submittedAt,
        status: ps.status,
      });
    }

    for (const en of recentEnrollments) {
      activities.push({
        type: "enrollment",
        title: `Mendaftar kursus`,
        courseName: en.course.title,
        date: en.enrolledAt,
        status: "Terdaftar",
      });
    }

    // Sort by date descending
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Paginate
    const total = activities.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedActivities = activities.slice(
      (page - 1) * limit,
      page * limit,
    );

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
            description: true,
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
      include: {
        course: { select: { id: true, category: true } },
      },
    });

    const enrolledCourseIds = enrollments.map((e) => e.course.id);
    const enrolledCategories = [
      ...new Set(enrollments.map((e) => e.course.category)),
    ];

    // Get recommended courses: published, not enrolled
    const recommendations = await prisma.course.findMany({
      where: {
        isPublished: true,
        id: { notIn: enrolledCourseIds },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        level: true,
        thumbnail: true,
        rating: true,
        creator: { select: { name: true } },
      },
      take: 8,
    });

    // Sort: prioritize same categories as enrolled courses
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
