"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { quizService } from "@/services/quiz.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function StudentQuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const courseId = params.courseId as string;

  const router = useRouter();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    attempt: any;
  } | null>(null);

  const {
    data: quiz,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => quizService.getQuizById(quizId),
    enabled: !!quizId,
  });

  const submitMutation = useMutation({
    mutationFn: (data: { answers: number[] }) =>
      quizService.submitQuiz(quizId, data),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Quiz berhasil dikirim!");
      // Invalidate course progress to update sidebar checks
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      // Also invalidate module if needed, but sidebar uses enrollment prop or refetch
      // Actually sidebar progress comes from server component or parent?
      // Sidebar is client component taking props. We need to refresh the page or parent query.
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Gagal mengirim jawaban quiz",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="text-destructive h-12 w-12" />
        <h2 className="text-xl font-semibold">Gagal memuat quiz</h2>
        <p className="text-muted-foreground">
          Terjadi kesalahan atau quiz tidak ditemukan.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    // Fill gaps if any
    for (let i = 0; i < quiz.questions.length; i++) {
      if (newAnswers[i] === undefined) newAnswers[i] = -1; // -1 for unanswered
    }
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    if (
      answers.length < quiz.questions.length ||
      answers.some((a) => a === undefined || a === -1)
    ) {
      toast.error("Mohon jawab semua pertanyaan sebelum mengirim.");
      return;
    }
    submitMutation.mutate({ answers });
  };

  if (result) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Link
            href={`/learning/${courseId}`}
            className="text-muted-foreground hover:text-primary flex items-center text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Materi
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl">Hasil Quiz</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            {result.passed ? (
              <CheckCircle className="h-24 w-24 text-green-500" />
            ) : (
              <XCircle className="h-24 w-24 text-red-500" />
            )}

            <div className="space-y-2 text-center">
              <h3 className="text-4xl font-bold">{Math.round(result.score)}</h3>
              <p className="text-muted-foreground">
                Passing Score: {quiz.passingScore}
              </p>
            </div>

            <div
              className={`rounded-full px-4 py-2 font-medium ${result.passed ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
            >
              {result.passed ? "LULUS" : "TIDAK LULUS"}
            </div>

            {!result.passed && (
              <Button
                onClick={() => {
                  setResult(null);
                  setAnswers([]);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Coba Lagi
              </Button>
            )}

            {result.passed && (
              <Button asChild>
                <Link href={`/learning/${courseId}`}>Lanjut Belajar</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            href={`/learning/${courseId}`}
            className="text-muted-foreground hover:text-primary flex items-center text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Quiz Modul</h1>
        <p className="text-muted-foreground">
          Jawablah pertanyaan berikut dengan benar untuk menyelesaikan modul
          ini.
        </p>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <Card key={q.id || qIndex}>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                {qIndex + 1}. {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[qIndex]?.toString()}
                onValueChange={(val) =>
                  handleAnswerChange(qIndex, parseInt(val))
                }
              >
                {q.options.map((opt, optIndex) => (
                  <div
                    key={optIndex}
                    className="flex items-center space-x-2 py-2"
                  >
                    <RadioGroupItem
                      value={optIndex.toString()}
                      id={`q${qIndex}-opt${optIndex}`}
                    />
                    <Label
                      htmlFor={`q${qIndex}-opt${optIndex}`}
                      className="cursor-pointer font-normal"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
            </>
          ) : (
            "Kirim Jawaban"
          )}
        </Button>
      </div>
    </div>
  );
}
