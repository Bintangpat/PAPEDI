"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CourseSettingsForm } from "./_components/course-settings-form";
import { ModulesList } from "./_components/modules-list";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [activeTab, setActiveTab] = useState("curriculum");

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourseById(courseId),
  });

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );

  if (isError || !course)
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold text-red-500">
          Gagal memuat kursus
        </h2>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mentor/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {course.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            Kelola materi dan pengaturan kursus Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {course.isPublished ? (
            <Badge className="bg-green-600 hover:bg-green-700">
              Terpublikasi
            </Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="curriculum">Kurikulum</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-6">
          <ModulesList course={course} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Kursus</CardTitle>
              <CardDescription>
                Ubah informasi dasar kursus Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseSettingsForm course={course} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
