"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonService } from "@/services/module.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lesson, LessonType } from "@/types/module";
import { Loader2 } from "lucide-react";

// Helper to define form schema
const formSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  type: z.nativeEnum(LessonType),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LessonFormProps {
  moduleId: string;
  lesson?: Lesson; // If provided, it's edit mode
  order?: number; // For create mode
  className?: string;
  onSuccess: () => void;
}

export function LessonForm({
  moduleId,
  lesson,
  order,
  onSuccess,
}: LessonFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: lesson?.title || "",
      type: lesson?.type || LessonType.VIDEO,
      content: lesson?.content || "",
      videoUrl: lesson?.videoUrl || "",
    },
  });

  // Watch type to conditionally show fields
  const lessonType = form.watch("type");

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      lessonService.createLesson({
        title: values.title,
        moduleId,
        type: values.type,
        content: values.content,
        videoUrl: values.videoUrl,
        // order tidak dikirim — backend auto-calculate dari jumlah lesson yang ada
      }),
    onSuccess: () => {
      toast.success("Materi berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["course"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan materi");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      lessonService.updateLesson(lesson!.id, {
        title: values.title,
        type: values.type,
        content: values.content,
        videoUrl: values.videoUrl,
      }),
    onSuccess: () => {
      toast.success("Materi berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["course"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui materi");
    },
  });

  function onSubmit(values: FormValues) {
    if (lesson) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Materi</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Pengenalan HTML" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Materi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={LessonType.VIDEO}>Video</SelectItem>
                  <SelectItem value={LessonType.TEXT}>
                    Teks / Artikel
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {lessonType === LessonType.VIDEO && (
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Video</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/..." {...field} />
                </FormControl>
                <FormDescription>
                  Masukkan link video pembelajaran (YouTube, Vimeo, dll).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {lessonType === LessonType.TEXT && (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konten Materi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tulis materi pembelajaran di sini..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {lesson ? "Simpan Perubahan" : "Tambah Materi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
