"use client";

import Link from "next/link";
import { useMentorCourses } from "@/hooks/use-course";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BookOpen,
  Users,
  MoreVertical,
  Pencil,
  Trash,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function MentorCoursesPage() {
  const { data: courses, isLoading, isError } = useMentorCourses();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold text-red-500">
          Gagal memuat kursus
        </h2>
        <p className="text-muted-foreground">
          Terjadi kesalahan saat mengambil data kursus Anda.
        </p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kursus Saya</h1>
          <p className="text-muted-foreground mt-1">
            Kelola materi pembelajaran dan siswa Anda di sini.
          </p>
        </div>
        <Link href="/mentor/courses/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Kursus Baru
          </Button>
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
          <div className="bg-primary/10 rounded-full p-4">
            <BookOpen className="text-primary h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">Belum ada kursus</h2>
          <p className="text-muted-foreground max-w-sm">
            Anda belum membuat kursus apapun. Mulai bagikan pengetahuan Anda
            sekarang.
          </p>
          <Link href="/mentor/courses/create">
            <Button variant="outline">Mulai Buat Kursus</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden">
              <div className="bg-muted relative aspect-video w-full overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={course.isPublished ? "default" : "secondary"}
                    className={
                      course.isPublished
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {course.isPublished ? "Publik" : "Draft"}
                  </Badge>
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <CardTitle className="line-clamp-2 text-lg leading-tight">
                      <Link
                        href={`/mentor/courses/${course.id}`}
                        className="hover:underline"
                      >
                        {course.title}
                      </Link>
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-mt-1 h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/mentor/courses/${course.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        {/* TODO: Add delete confirmation dialog */}
                        <Trash className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 pt-0">
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {course.description}
                </p>
              </CardContent>

              <CardFooter className="bg-muted/20 flex items-center justify-between border-t p-4 py-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{course._count?.modules || 0} Modul</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{course._count?.enrollments || 0} Siswa</span>
                </div>
                <div>
                  {format(new Date(course.createdAt), "dd MMM yyyy", {
                    locale: id,
                  })}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
