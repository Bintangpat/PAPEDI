"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/course.service";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function LearningRedirectPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourseById(courseId as string),
    enabled: !!courseId,
  });

  useEffect(() => {
    if (course && course.modules && course.modules.length > 0) {
      // Find first lesson of first module
      const firstModule = course.modules[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        const firstLesson = firstModule.lessons[0];
        router.replace(`/learning/${courseId}/${firstLesson.id}`);
      }
    }
  }, [course, courseId, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-20 text-center">
      <p>Mengalihkan ke materi pertama...</p>
    </div>
  );
}
