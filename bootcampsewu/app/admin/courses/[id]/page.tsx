"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  FileText,
  Video,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Course } from "@/types";
import { CourseCategory, CourseLevel } from "@/types/course";

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(["WEBDEV", "SEO", "SOCIAL_MEDIA"]),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  thumbnail: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [moduleIdToDelete, setModuleIdToDelete] = useState<string | null>(null);

  // Fetch Course Data
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", id],
    queryFn: async () => {
      const res = await api.get(`/courses/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "PROGRAMMING",
      level: "BEGINNER",
      thumbnail: undefined,
      isPublished: false,
    } as any,
  });

  // Set form values when data loaded
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        thumbnail: course.thumbnail || "",
        isPublished: course.isPublished,
      });
    }
  }, [course, form]);

  // Update Course Mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (values: z.infer<typeof courseSchema>) => {
      await api.put(`/courses/${id}`, values);
    },
    onSuccess: () => {
      toast.success("Kursus berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui kursus");
    },
  });

  // Create Module Mutation
  const createModuleMutation = useMutation({
    mutationFn: async (title: string) => {
      await api.post("/modules", {
        title,
        courseId: id,
        order: course?.modules?.length || 0,
      });
    },
    onSuccess: () => {
      toast.success("Modul berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });

  // Delete Module Mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      await api.delete(`/modules/${moduleId}`);
    },
    onSuccess: () => {
      toast.success("Modul berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });

  // Create Lesson Mutation
  const createLessonMutation = useMutation({
    mutationFn: async ({
      title,
      moduleId,
    }: {
      title: string;
      moduleId: string;
    }) => {
      // Find max order in this module
      const module = course?.modules?.find((m: any) => m.id === moduleId);
      const order = module?.lessons?.length || 0;

      await api.post("/lessons", {
        title,
        moduleId,
        type: "VIDEO", // Default
        content: "",
        videoUrl: "",
        order,
      });
    },
    onSuccess: () => {
      toast.success("Materi berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });

  function onSubmit(values: z.infer<typeof courseSchema>) {
    updateCourseMutation.mutate(values);
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Kursus</h1>
          <p className="text-muted-foreground">{course?.title}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/courses/${id}`} target="_blank">
              Preview
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Course Details Form */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kursus</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ALL">
                                Semua Kategori
                              </SelectItem>
                              <SelectItem value={CourseCategory.WEBDEV}>
                                Web Development
                              </SelectItem>
                              <SelectItem value={CourseCategory.SEO}>
                                Simple SEO
                              </SelectItem>
                              <SelectItem value={CourseCategory.SOCIAL_MEDIA}>
                                Social Media
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BEGINNER">Pemula</SelectItem>
                              <SelectItem value="INTERMEDIATE">
                                Menengah
                              </SelectItem>
                              <SelectItem value="ADVANCED">Mahir</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={updateCourseMutation.isPending}
                    >
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Curriculum / Modules Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Kurikulum</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Modul
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Modul Baru</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="module-title">Judul Modul</Label>
                    <Input
                      id="module-title"
                      placeholder="Pengenalan..."
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        const input = document.getElementById(
                          "module-title",
                        ) as HTMLInputElement;
                        if (input.value) {
                          createModuleMutation.mutate(input.value);
                          // Close logic would need state, keep simple for now
                        }
                      }}
                    >
                      Simpan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {course?.modules?.map((module: any, index: number) => (
                <Card key={module.id} className="overflow-hidden">
                  <div className="bg-muted/50 flex items-center justify-between border-b p-3">
                    <div className="flex items-center gap-2 font-medium">
                      <GripVertical className="text-muted-foreground h-4 w-4 cursor-move" />
                      <span>
                        Modul {index + 1}: {module.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-red-600"
                        onClick={() => deleteModuleMutation.mutate(module.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-0">
                    {/* Lesson List */}
                    <div className="divide-y">
                      {module.lessons?.map((lesson: any) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 pl-8 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.type === "VIDEO" ? (
                              <Video className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {(!module.lessons || module.lessons.length === 0) && (
                        <div className="text-muted-foreground p-4 text-center text-sm">
                          Belum ada materi.
                        </div>
                      )}
                      <div className="bg-slate-50 p-2 dark:bg-slate-900/50">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-primary w-full justify-start"
                            >
                              <Plus className="mr-2 h-3 w-3" /> Tambah Materi
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Tambah Materi ke {module.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <Label>Judul Materi</Label>
                              <Input
                                id={`lesson-title-${module.id}`}
                                className="mt-2"
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  const input = document.getElementById(
                                    `lesson-title-${module.id}`,
                                  ) as HTMLInputElement;
                                  if (input.value)
                                    createLessonMutation.mutate({
                                      title: input.value,
                                      moduleId: module.id,
                                    });
                                }}
                              >
                                Simpan
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Publishing & Meta */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Publikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={course?.isPublished ? "default" : "secondary"}>
                  {course?.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <Button
                variant={course?.isPublished ? "outline" : "default"}
                className="w-full"
                onClick={() => {
                  if (!course) return;
                  const newStatus = !course.isPublished;
                  // Update just the status
                  form.setValue("isPublished", newStatus);
                  onSubmit(form.getValues());
                }}
              >
                {course?.isPublished ? "Unpublish Kursus" : "Publish Kursus"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
