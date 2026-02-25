import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CourseCategory, CourseLevel } from "@prisma/client";

// ==========================================
// SCORING CONFIGURATION
// ==========================================

// Bobot: jawaban utama → +3, jawaban minor → +1
const SCORE_MAIN = 3;
const SCORE_MINOR = 1;

type CategoryScores = Record<CourseCategory, number>;

/**
 * Step 1 – Tujuan Utama
 * Mapping: 1→WEBDEV, 2→SEO, 3→SOCIAL_MEDIA, 4→weighted, 5→weighted
 */
function scoreStep1(answer: string, scores: CategoryScores): void {
  switch (answer) {
    case "1":
      scores.WEBDEV += SCORE_MAIN;
      break;
    case "2":
      scores.SEO += SCORE_MAIN;
      break;
    case "3":
      scores.SOCIAL_MEDIA += SCORE_MAIN;
      break;
    case "4":
      // Jasa digital → minor ke semua, keputusan dari pertanyaan lain
      scores.WEBDEV += SCORE_MINOR;
      scores.SEO += SCORE_MINOR;
      scores.SOCIAL_MEDIA += SCORE_MINOR;
      break;
    case "5":
      // Eksplorasi → tidak menambah skor, weighted dari pertanyaan lain
      break;
  }
}

/**
 * Step 2 – Minat Aktivitas
 * Mapping: 1→WEBDEV, 2→SEO, 3→SOCIAL_MEDIA,
 *          4→SEO (+minor WEBDEV), 5→SOCIAL_MEDIA (+minor SEO)
 */
function scoreStep2(answer: string, scores: CategoryScores): void {
  switch (answer) {
    case "1":
      scores.WEBDEV += SCORE_MAIN;
      break;
    case "2":
      scores.SEO += SCORE_MAIN;
      break;
    case "3":
      scores.SOCIAL_MEDIA += SCORE_MAIN;
      break;
    case "4":
      scores.SEO += SCORE_MAIN;
      scores.WEBDEV += SCORE_MINOR;
      break;
    case "5":
      scores.SOCIAL_MEDIA += SCORE_MAIN;
      scores.SEO += SCORE_MINOR;
      break;
  }
}

/**
 * Step 3 – Tingkat Pengalaman → menentukan LEVEL, bukan kategori
 * 1→BEGINNER, 2→BEGINNER, 3→INTERMEDIATE, 4→ADVANCED
 */
function mapExperienceToLevel(answer: string): CourseLevel {
  switch (answer) {
    case "1":
      return CourseLevel.BEGINNER;
    case "2":
      return CourseLevel.BEGINNER;
    case "3":
      return CourseLevel.INTERMEDIATE;
    case "4":
      return CourseLevel.ADVANCED;
    default:
      return CourseLevel.BEGINNER;
  }
}

/**
 * Step 4 – Fokus Hasil yang Diinginkan
 * Mapping: 1→WEBDEV, 2→SEO, 3→SOCIAL_MEDIA, 4→weighted (tertinggi sebelumnya)
 */
function scoreStep4(
  answer: string,
  scores: CategoryScores,
  q1Answer: string,
): void {
  switch (answer) {
    case "1":
      scores.WEBDEV += SCORE_MAIN;
      break;
    case "2":
      scores.SEO += SCORE_MAIN;
      break;
    case "3":
      scores.SOCIAL_MEDIA += SCORE_MAIN;
      break;
    case "4":
      // Weighted: gunakan jawaban Step 1 sebagai penentu minor
      if (q1Answer === "1") scores.WEBDEV += SCORE_MINOR;
      else if (q1Answer === "2") scores.SEO += SCORE_MINOR;
      else if (q1Answer === "3") scores.SOCIAL_MEDIA += SCORE_MINOR;
      else {
        // fallback: +1 ke semua
        scores.WEBDEV += SCORE_MINOR;
        scores.SEO += SCORE_MINOR;
        scores.SOCIAL_MEDIA += SCORE_MINOR;
      }
      break;
  }
}

/**
 * Step 5 – Preferensi Gaya Kerja
 * Mapping: 1→WEBDEV, 2→SEO, 3→SOCIAL_MEDIA, 4→SOCIAL_MEDIA (+minor SEO)
 */
function scoreStep5(answer: string, scores: CategoryScores): void {
  switch (answer) {
    case "1":
      scores.WEBDEV += SCORE_MAIN;
      break;
    case "2":
      scores.SEO += SCORE_MAIN;
      break;
    case "3":
      scores.SOCIAL_MEDIA += SCORE_MAIN;
      break;
    case "4":
      scores.SOCIAL_MEDIA += SCORE_MAIN;
      scores.SEO += SCORE_MINOR;
      break;
  }
}

/**
 * Determine the category with the highest score.
 * Tie-breaking: use Step 1 answer as the primary decider.
 */
function getTopCategory(
  scores: CategoryScores,
  q1Answer: string,
): CourseCategory {
  const entries = Object.entries(scores) as [CourseCategory, number][];
  entries.sort((a, b) => b[1] - a[1]);

  // If there's a tie, use Step 1 to break it
  if (entries[0][1] === entries[1][1]) {
    const tieBreaker: Record<string, CourseCategory> = {
      "1": CourseCategory.WEBDEV,
      "2": CourseCategory.SEO,
      "3": CourseCategory.SOCIAL_MEDIA,
    };
    return tieBreaker[q1Answer] || entries[0][0];
  }

  return entries[0][0];
}

// ==========================================
// CONTROLLERS
// ==========================================

/**
 * @desc    Submit survey dan dapatkan rekomendasi
 * @route   POST /api/v1/survey/submit
 * @access  Private (Student)
 */
export const submitSurvey = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { q1Goal, q2Interest, q3Experience, q4Result, q5Style } = req.body;

    // Validate all fields are present
    if (!q1Goal || !q2Interest || !q3Experience || !q4Result || !q5Style) {
      throw new AppError("Semua pertanyaan wajib dijawab.", 400);
    }

    // Validate answer ranges
    const validRanges: Record<string, string[]> = {
      q1Goal: ["1", "2", "3", "4", "5"],
      q2Interest: ["1", "2", "3", "4", "5"],
      q3Experience: ["1", "2", "3", "4"],
      q4Result: ["1", "2", "3", "4"],
      q5Style: ["1", "2", "3", "4"],
    };

    if (!validRanges.q1Goal.includes(q1Goal)) {
      throw new AppError("Jawaban Step 1 tidak valid.", 400);
    }
    if (!validRanges.q2Interest.includes(q2Interest)) {
      throw new AppError("Jawaban Step 2 tidak valid.", 400);
    }
    if (!validRanges.q3Experience.includes(q3Experience)) {
      throw new AppError("Jawaban Step 3 tidak valid.", 400);
    }
    if (!validRanges.q4Result.includes(q4Result)) {
      throw new AppError("Jawaban Step 4 tidak valid.", 400);
    }
    if (!validRanges.q5Style.includes(q5Style)) {
      throw new AppError("Jawaban Step 5 tidak valid.", 400);
    }

    // Calculate scores
    const scores: CategoryScores = {
      WEBDEV: 0,
      SEO: 0,
      SOCIAL_MEDIA: 0,
    };

    scoreStep1(q1Goal, scores);
    scoreStep2(q2Interest, scores);
    // Step 3 → level only, no category scoring
    scoreStep4(q4Result, scores, q1Goal);
    scoreStep5(q5Style, scores);

    const recommendedCategory = getTopCategory(scores, q1Goal);
    const recommendedLevel = mapExperienceToLevel(q3Experience);

    // Map q2Interest to CourseCategory for q3Interest field in schema
    const interestToCategory: Record<string, CourseCategory> = {
      "1": CourseCategory.WEBDEV,
      "2": CourseCategory.SEO,
      "3": CourseCategory.SOCIAL_MEDIA,
      "4": CourseCategory.SEO,
      "5": CourseCategory.SOCIAL_MEDIA,
    };

    // Upsert: 1 user = 1 survey response
    const surveyResponse = await prisma.surveyResponse.upsert({
      where: { userId },
      create: {
        userId,
        q1Goal,
        q2Experience: q3Experience,
        q3Interest: interestToCategory[q2Interest] || CourseCategory.WEBDEV,
        q4LearningStyle: q4Result,
        q5TimeCommitment: q5Style,
        recommendedCategory,
        recommendedLevel,
        scoreBreakdown: scores,
      },
      update: {
        q1Goal,
        q2Experience: q3Experience,
        q3Interest: interestToCategory[q2Interest] || CourseCategory.WEBDEV,
        q4LearningStyle: q4Result,
        q5TimeCommitment: q5Style,
        recommendedCategory,
        recommendedLevel,
        scoreBreakdown: scores,
      },
    });

    // Get recommended courses
    const recommendedCourses = await prisma.course.findMany({
      where: {
        category: recommendedCategory,
        level: recommendedLevel,
        isPublished: true,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        level: true,
        thumbnail: true,
        rating: true,
      },
      take: 5,
    });

    res.status(200).json({
      success: true,
      message: "Survei berhasil disubmit.",
      data: {
        surveyId: surveyResponse.id,
        recommendedCategory,
        recommendedLevel,
        scoreBreakdown: scores,
        recommendedCourses,
      },
    });
  },
);

/**
 * @desc    Get survey result untuk user yang sudah submit
 * @route   GET /api/v1/survey/result
 * @access  Private (Student)
 */
export const getSurveyResult = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const surveyResponse = await prisma.surveyResponse.findUnique({
      where: { userId },
    });

    if (!surveyResponse) {
      return res.status(200).json({
        success: true,
        hasSurvey: false,
        data: null,
      });
    }

    // Fetch recommended courses based on saved result
    const recommendedCourses = await prisma.course.findMany({
      where: {
        category: surveyResponse.recommendedCategory,
        level: surveyResponse.recommendedLevel,
        isPublished: true,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        level: true,
        thumbnail: true,
        rating: true,
      },
      take: 5,
    });

    res.status(200).json({
      success: true,
      hasSurvey: true,
      data: {
        surveyId: surveyResponse.id,
        recommendedCategory: surveyResponse.recommendedCategory,
        recommendedLevel: surveyResponse.recommendedLevel,
        scoreBreakdown: surveyResponse.scoreBreakdown,
        recommendedCourses,
        completedAt: surveyResponse.createdAt,
      },
    });
  },
);
