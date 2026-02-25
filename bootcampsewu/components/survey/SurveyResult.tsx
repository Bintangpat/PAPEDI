"use client";

import { Button } from "@/components/ui/button";
import {
  SurveyResult as SurveyResultType,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
} from "@/types/survey";
import { CourseCategory } from "@/types/course";
import { useRouter } from "next/navigation";
import { Trophy, ArrowRight, X } from "lucide-react";

interface SurveyResultProps {
  result: SurveyResultType;
  onClose: () => void;
}

// Emoji/icon per category
const CATEGORY_ICONS: Record<CourseCategory, string> = {
  [CourseCategory.WEBDEV]: "🌐",
  [CourseCategory.SEO]: "📊",
  [CourseCategory.SOCIAL_MEDIA]: "📱",
};

export function SurveyResult({ result, onClose }: SurveyResultProps) {
  const router = useRouter();

  const handleViewCourses = () => {
    const categoryParam = result.recommendedCategory.toLowerCase();
    const levelParam = result.recommendedLevel.toLowerCase();
    router.push(
      `/courses?category=${categoryParam}&level=${levelParam}&source=survey_recommendation`,
    );
    onClose();
  };

  return (
    <div className="space-y-6 text-center">
      {/* Trophy Icon */}
      <div className="flex justify-center">
        <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
          <Trophy className="text-primary h-8 w-8" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Rekomendasi Untukmu!</h3>
        <p className="text-muted-foreground text-sm">
          Berdasarkan jawaban kamu, berikut rekomendasi pelatihan terbaik.
        </p>
      </div>

      {/* Recommendation Card */}
      <div className="border-primary/20 bg-primary/5 space-y-3 rounded-xl border-2 p-6">
        <div className="text-4xl">
          {CATEGORY_ICONS[result.recommendedCategory]}
        </div>
        <h4 className="text-primary text-lg font-bold">
          {CATEGORY_LABELS[result.recommendedCategory]}
        </h4>
        <p className="text-muted-foreground text-sm">
          {CATEGORY_DESCRIPTIONS[result.recommendedCategory]}
        </p>
        <div className="bg-primary/10 text-primary inline-block rounded-full px-3 py-1 text-xs font-medium">
          Level: {result.recommendedLevel}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Breakdown Skor
        </p>
        <div className="flex justify-center gap-4">
          {Object.entries(result.scoreBreakdown).map(([category, score]) => (
            <div
              key={category}
              className="flex min-w-[80px] flex-col items-center gap-1 rounded-lg border p-2"
            >
              <span className="text-muted-foreground text-xs">
                {CATEGORY_LABELS[category as CourseCategory]?.split(" ")[0]}
              </span>
              <span className="text-lg font-bold">{score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={handleViewCourses} className="gap-2">
          Lihat Pelatihan
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onClose} className="gap-2">
          <X className="h-4 w-4" />
          Lewati
        </Button>
      </div>

      {/* Recommended Courses Preview */}
      {result.recommendedCourses && result.recommendedCourses.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Kursus yang Direkomendasikan
          </p>
          <div className="space-y-2">
            {result.recommendedCourses.slice(0, 3).map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  router.push(`/courses/${course.id}`);
                  onClose();
                }}
                className="hover:bg-muted/50 w-full rounded-lg border p-3 text-left transition-colors"
              >
                <p className="truncate text-sm font-medium">{course.title}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {course.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
