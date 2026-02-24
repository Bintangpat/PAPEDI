"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { quizService } from "@/services/quiz.service";
import { QuizEditor } from "@/components/quiz-editor";
import { Loader2 } from "lucide-react";

export default function QuizPage() {
  const { moduleId } = useParams();

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", moduleId, "editor"],
    queryFn: () => quizService.getQuizForEditor(moduleId as string),
    enabled: !!moduleId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <QuizEditor moduleId={moduleId as string} initialData={quiz} />
    </div>
  );
}
