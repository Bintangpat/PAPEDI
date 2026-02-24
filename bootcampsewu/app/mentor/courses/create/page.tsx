"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import { useRouter } from "next/navigation";
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
import { CourseCategory, CourseLevel } from "@/types/course";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  category: z.nativeEnum(CourseCategory),
  level: z.nativeEnum(CourseLevel),
  thumbnail: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: any) => courseService.createCourse(values),
    onSuccess: (data) => {
      toast.success("Kursus berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["mentor-courses"] });
      router.push(`/mentor/courses`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal membuat kursus");
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/mentor/courses"
          className="text-muted-foreground hover:text-primary mb-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kursus
        </Link>
        <h1 className="text-3xl font-bold">Buat Kursus Baru</h1>
        <p className="text-muted-foreground">
          Isi informasi dasar kursus Anda.
        </p>
      </div>

      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Kursus</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Belajar React dari Nol"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Singkat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan apa yang akan dipelajari siswa..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CourseCategory.WEBDEV}>
                          Web Development
                        </SelectItem>
                        <SelectItem value={CourseCategory.SEO}>
                          Simple SEO
                        </SelectItem>
                        <SelectItem value={CourseCategory.SOCIAL_MEDIA}>
                          Social Media Strategy
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CourseLevel.BEGINNER}>
                          Pemula
                        </SelectItem>
                        <SelectItem value={CourseLevel.INTERMEDIATE}>
                          Menengah
                        </SelectItem>
                        <SelectItem value={CourseLevel.ADVANCED}>
                          Mahir
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Thumbnail (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/mentor/courses">
                <Button variant="outline" type="button">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Buat Kursus
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
