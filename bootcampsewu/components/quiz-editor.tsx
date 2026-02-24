"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Quiz, QuizQuestion, UpsertQuizData } from "@/types/quiz";
import { quizService } from "@/services/quiz.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Save, ArrowLeft, GripVertical } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface QuizEditorProps {
  moduleId: string;
  initialData?: Quiz | null;
}

export function QuizEditor({ moduleId, initialData }: QuizEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpsertQuizData>({
    defaultValues: {
      moduleId,
      passingScore: initialData?.passingScore || 80,
      questions: initialData?.questions || [
        { question: "", options: ["", "", "", ""], correctAnswer: 0 },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "questions",
  });

  const upsertMutation = useMutation({
    mutationFn: quizService.upsertQuiz,
    onSuccess: () => {
      toast.success("Quiz berhasil disimpan!");
      queryClient.invalidateQueries({ queryKey: ["quiz", moduleId] });
      router.back();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menyimpan quiz");
    },
  });

  const onSubmit = (data: UpsertQuizData) => {
    // Validate that all questions have non-empty options and valid correct answer
    const isValid = data.questions.every(
      (q) =>
        q.question.trim() !== "" && q.options.every((opt) => opt.trim() !== ""),
    );

    if (!isValid) {
      toast.error("Mohon lengkapi semua pertanyaan dan opsi jawaban.");
      return;
    }

    upsertMutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-4xl space-y-8 pb-20"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Quiz</h1>
          <p className="text-muted-foreground">
            Atur pertanyaan dan kunci jawaban untuk modul ini.
          </p>
        </div>
      </div>

      <div className="bg-card flex items-end gap-4 rounded-lg border p-4">
        <div className="w-full max-w-xs space-y-2">
          <Label htmlFor="passingScore">
            Passing Score (Min. Nilai Kelulusan)
          </Label>
          <Input
            id="passingScore"
            type="number"
            min="0"
            max="100"
            {...register("passingScore", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                type="button"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-muted text-muted-foreground cursor-grab rounded p-2">
                <GripVertical className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Pertanyaan #{index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pertanyaan</Label>
                <Textarea
                  placeholder="Tulis pertanyaan disini..."
                  {...register(`questions.${index}.question` as const, {
                    required: true,
                  })}
                />
              </div>

              <div className="space-y-3">
                <Label>Pilihan Jawaban (Pilih yang benar)</Label>
                <Controller
                  control={control}
                  name={`questions.${index}.correctAnswer`}
                  render={({ field: radioField }) => (
                    <RadioGroup
                      onValueChange={(val) =>
                        radioField.onChange(parseInt(val))
                      }
                      value={radioField.value.toString()}
                      className="space-y-2"
                    >
                      {[0, 1, 2, 3].map((optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <RadioGroupItem
                            value={optIndex.toString()}
                            id={`q${index}-opt${optIndex}`}
                          />
                          <Input
                            placeholder={`Opsi ${["A", "B", "C", "D"][optIndex]}`}
                            {...register(
                              `questions.${index}.options.${optIndex}` as const,
                              { required: true },
                            )}
                            className={
                              radioField.value === optIndex
                                ? "border-primary ring-primary ring-1"
                                : ""
                            }
                          />
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed py-8"
        onClick={() =>
          append({ question: "", options: ["", "", "", ""], correctAnswer: 0 })
        }
      >
        <Plus className="mr-2 h-4 w-4" /> Tambah Pertanyaan
      </Button>

      <div className="bg-background fixed right-0 bottom-0 left-0 container mx-auto flex max-w-4xl justify-end border-t p-4">
        <Button type="submit" size="lg" disabled={upsertMutation.isPending}>
          {upsertMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Simpan Quiz
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
