/**
 * Data Migration Script: Migrate legacy progress data to new ModuleProgress table
 *
 * This script converts `completedLessons[]` and `completedQuizzes[]` arrays
 * from the Enrollment table into proper ModuleProgress records.
 *
 * Run with: npx tsx src/prisma/migrate-progress.ts
 */

import prisma from "../config/prisma.js";

async function migrateProgress() {
  console.log("🔄 Starting progress data migration...\n");

  // 1. Fetch all enrollments with their course modules
  const enrollments = await prisma.enrollment.findMany({
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: { select: { id: true } },
              quiz: { select: { id: true } },
              project: { select: { id: true } },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  console.log(`📋 Found ${enrollments.length} enrollments to process.\n`);

  let created = 0;
  let skipped = 0;

  for (const enrollment of enrollments) {
    const modules = enrollment.course.modules;

    for (const mod of modules) {
      // Check if ModuleProgress already exists
      const existing = await prisma.moduleProgress.findUnique({
        where: {
          enrollmentId_moduleId: {
            enrollmentId: enrollment.id,
            moduleId: mod.id,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Determine module completion status based on legacy arrays
      const lessonIds = mod.lessons.map((l) => l.id);
      const quizId = mod.quiz?.id;

      const allLessonsCompleted = lessonIds.every((id) =>
        enrollment.completedLessons.includes(id),
      );

      const quizCompleted = quizId
        ? enrollment.completedQuizzes.includes(quizId)
        : true; // If no quiz, consider it done

      let status: "LOCKED" | "IN_PROGRESS" | "COMPLETED";
      let isPassed = false;

      if (allLessonsCompleted && quizCompleted) {
        status = "COMPLETED";
        isPassed = true;
      } else if (
        lessonIds.some((id) => enrollment.completedLessons.includes(id)) ||
        (quizId && enrollment.completedQuizzes.includes(quizId))
      ) {
        status = "IN_PROGRESS";
      } else {
        status = "IN_PROGRESS"; // Default to IN_PROGRESS (lessons are always accessible per PRD)
      }

      // Get average quiz score for this module if quiz was attempted
      let averageQuizScore: number | null = null;
      if (quizId) {
        const quizAttempts = await prisma.quizAttempt.findMany({
          where: {
            userId: enrollment.userId,
            quizId: quizId,
          },
          orderBy: { score: "desc" },
          take: 1,
        });

        if (quizAttempts.length > 0) {
          averageQuizScore = quizAttempts[0].score; // Best score
        }
      }

      await prisma.moduleProgress.create({
        data: {
          enrollmentId: enrollment.id,
          moduleId: mod.id,
          status,
          isPassed,
          averageQuizScore,
        },
      });

      created++;
    }

    // Update enrollment status based on module completion
    const allModulesCompleted =
      modules.length > 0 &&
      modules.every((mod) => {
        const lessonIds = mod.lessons.map((l) => l.id);
        const quizId = mod.quiz?.id;
        const allLessonsCompleted = lessonIds.every((id) =>
          enrollment.completedLessons.includes(id),
        );
        const quizCompleted = quizId
          ? enrollment.completedQuizzes.includes(quizId)
          : true;
        return allLessonsCompleted && quizCompleted;
      });

    if (allModulesCompleted && modules.length > 0) {
      // Check if final project is passed
      const projects = modules.flatMap((m: any) =>
        m.project ? [m.project.id] : [],
      );

      let allProjectsPassed = true;
      if (projects.length > 0) {
        const passedCount = await prisma.projectSubmission.count({
          where: {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            status: "LULUS",
            projectId: { in: projects },
          },
        });
        allProjectsPassed = passedCount >= projects.length;
      }

      if (allProjectsPassed) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "COMPLETED" },
        });
      }
    }
  }

  console.log(`✅ Created ${created} ModuleProgress records.`);
  console.log(`⏭️  Skipped ${skipped} (already existed).`);
  console.log("\n🎉 Migration complete!");
}

migrateProgress()
  .catch((e) => {
    console.error("❌ Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
