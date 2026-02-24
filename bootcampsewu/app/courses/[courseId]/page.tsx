"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/course.service";
import { useCheckEnrollment, useEnrollCourse } from "@/hooks/use-enrollment";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  CheckCircle,
  Lock,
  PlayCircle,
  User,
  Video,
  FileText,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { Module } from "@/types/module";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Fetch Course Details (Public)
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourseById(courseId),
  });

  // Check Enrollment (Private) — via hook
  const { data: enrollmentData, isLoading: isEnrollmentLoading } =
    useCheckEnrollment(courseId);

  const isEnrolled = enrollmentData?.isEnrolled;

  // Enroll Mutation — via hook
  const enrollMutation = useEnrollCourse(courseId);

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu untuk mendaftar.");
      router.push("/auth/login?redirect=/courses/" + courseId);
      return;
    }
    enrollMutation.mutate();
  };

  const handleContinue = () => {
    router.push(`/learning/${courseId}`);
  };

  if (isCourseLoading) {
    return (
      <div className="container space-y-8 py-10">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Kursus tidak ditemukan
        </h1>
        <Button className="mt-4" onClick={() => router.push("/courses")}>
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Content */}
        <div className="space-y-8 md:col-span-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Badge>{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight">
              {course.title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-4 border-y py-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={course.creator?.avatar || ""} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {course.creator?.name || "Instruktur"}
              </p>
              <p className="text-muted-foreground text-sm">
                {course.creator?.bio || "Pengajar di PAPEDI"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Materi Kursus</h2>
            <Accordion type="single" collapsible className="w-full">
              {course.modules?.map((module: Module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <span className="text-left font-medium">
                      {module.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {module.lessons?.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 rounded px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                        >
                          {lesson.type === "VIDEO" ? (
                            <Video className="h-4 w-4 text-slate-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-slate-500" />
                          )}
                          <span className="flex-1 text-sm">{lesson.title}</span>
                          {isEnrolled ? (
                            <Badge variant="secondary" className="text-xs">
                              Akses
                            </Badge>
                          ) : (
                            <Lock className="text-muted-foreground h-3 w-3" />
                          )}
                        </div>
                      ))}
                      {module.project && (
                        <div className="mt-2 flex items-center gap-3 rounded border-t px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <Briefcase className="h-4 w-4 text-indigo-500" />
                          <span className="flex-1 text-sm font-medium">
                            Project Akhir: {module.project.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Right Column: Enrollment Card */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-slate-100">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <BookOpen className="h-12 w-12" />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Gratis</CardTitle>
              <CardDescription>
                Akses selamanya ke seluruh materi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthenticated ? (
                isEnrollmentLoading ? (
                  <Button disabled className="w-full">
                    Memuat...
                  </Button>
                ) : isEnrolled ? (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleContinue}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" /> Lanjut Belajar
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending
                      ? "Mendaftarkan..."
                      : "Daftar Sekarang"}
                  </Button>
                )
              ) : (
                <Button className="w-full" onClick={handleEnroll}>
                  Daftar Sekarang
                </Button>
              )}

              <div className="text-muted-foreground space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course._count?.modules || 0} Modul Pembelajaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Project Based Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Certificate of Completion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
