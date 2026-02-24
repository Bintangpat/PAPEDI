"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { lessonService } from "@/services/module.service";
import { enrollmentService } from "@/services/enrollment.service";
import {
  Loader2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function LessonPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch Lesson Content (Secure)
  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => lessonService.getLesson(lessonId),
    enabled: !!lessonId,
  });

  // Fetch Enrollment for progress check
  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () => enrollmentService.checkEnrollment(courseId),
  });

  const isCompleted = enrollment?.data?.completedLessons?.includes(lessonId);

  // Mark Complete Mutation
  const completeMutation = useMutation({
    mutationFn: () => enrollmentService.markLessonComplete(courseId, lessonId),
    onSuccess: () => {
      toast.success("Materi selesai!");
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      // Logic to go to next lesson?
    },
    onError: () => {
      toast.error("Gagal menandai selesai.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="py-20 text-center">Materi tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="outline">
              {lesson.type === "VIDEO" ? "Video" : "Artikel"}
            </Badge>
            {isCompleted && <Badge className="bg-green-600">Selesai</Badge>}
          </div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </div>

        {!isCompleted && (
          <Button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
          >
            {completeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Tandai Selesai
          </Button>
        )}
      </div>

      <div className="mt-6">
        {lesson.type === "VIDEO" && lesson.videoUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-lg">
            {/* Simple embed logic for YouTube/Vimeo if needed, or just iframe */}
            <iframe
              src={lesson.videoUrl.replace("watch?v=", "embed/")}
              className="h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none rounded-lg bg-slate-50 p-6 dark:bg-slate-900">
            {/* In real app, use Markdown renderer */}
            <div className="whitespace-pre-wrap">{lesson.content}</div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Sebelumnya
        </Button>
        {/* Next button logic would require knowing next lesson ID from course structure */}
        <Button variant="outline">
          Selanjutnya <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
