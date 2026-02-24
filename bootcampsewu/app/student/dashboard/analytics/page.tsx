"use client";

import { useEffect, useState } from "react";
import { studentDashboardService } from "@/services/student-dashboard.service";
import { CourseProgress } from "@/types/student-dashboard";
import { AlertCircle, BarChart3, RefreshCcw, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [progressData, summaryData] = await Promise.all([
        studentDashboardService.getProgress(),
        studentDashboardService.getSummary(),
      ]);
      setProgress(progressData);
      setSummary(summaryData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-red-600">Gagal memuat data</p>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <RefreshCcw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    );
  }

  const completedCourses = progress.filter((p) => p.progress === 100);
  const inProgressCourses = progress.filter((p) => p.progress < 100);
  const completionRate =
    progress.length > 0
      ? Math.round((completedCourses.length / progress.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Ringkasan statistik pembelajaran Anda.
        </p>
      </div>

      {/* Completion Rate Overview */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Completion Rate</p>
            <p className="mt-2 text-4xl font-bold text-emerald-600">
              {completionRate}%
            </p>
            <Progress value={completionRate} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Rata-rata Quiz</p>
            <p className="mt-2 text-4xl font-bold text-amber-600">
              {summary?.avgQuizScore ?? 0}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Project Disetujui</p>
            <p className="mt-2 text-4xl font-bold text-violet-600">
              {summary?.approvedProjects ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart (visual bars) */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Progress per Kursus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Belum ada data kursus.
            </p>
          ) : (
            <div className="space-y-4">
              {progress.map((cp) => (
                <div key={cp.courseId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{cp.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={cp.progress === 100 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {cp.progress === 100 ? "Selesai" : "Berjalan"}
                      </Badge>
                      <span className="text-muted-foreground w-10 text-right">
                        {cp.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-6 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        cp.progress === 100
                          ? "bg-emerald-500"
                          : cp.progress >= 50
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${cp.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Ringkasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Kursus Berjalan</p>
              <p className="mt-1 text-2xl font-bold">
                {inProgressCourses.length}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">Kursus Selesai</p>
              <p className="mt-1 text-2xl font-bold">
                {completedCourses.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
