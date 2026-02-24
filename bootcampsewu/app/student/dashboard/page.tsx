"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { studentDashboardService } from "@/services/student-dashboard.service";
import {
  DashboardSummary,
  CourseProgress,
  ActivityItem,
  DashboardCertificate,
  CourseRecommendation,
} from "@/types/student-dashboard";
import Link from "next/link";

import {
  BookOpen,
  CheckCircle2,
  Trophy,
  ClipboardCheck,
  ArrowRight,
  BarChart3,
  Clock,
  Award,
  Sparkles,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Loading Skeleton ────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      {/* Progress */}
      <Skeleton className="h-64 rounded-xl" />
      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p className="text-lg font-medium text-red-600 dark:text-red-400">
        Gagal memuat data dashboard
      </p>
      <p className="text-muted-foreground text-sm">
        Terjadi kesalahan saat mengambil data. Silakan coba lagi.
      </p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCcw className="h-4 w-4" />
        Coba Lagi
      </Button>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
      <div
        className={`absolute inset-0 opacity-10 ${color}`}
        style={{ background: "currentColor" }}
      />
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-xl p-3 ${color} bg-opacity-15`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [certificates, setCertificates] = useState<DashboardCertificate[]>([]);
  const [recommendations, setRecommendations] = useState<
    CourseRecommendation[]
  >([]);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [summaryData, progressData, activityData, certData, recsData] =
        await Promise.all([
          studentDashboardService.getSummary(),
          studentDashboardService.getProgress(),
          studentDashboardService.getActivity(1, 5),
          studentDashboardService.getCertificates(),
          studentDashboardService.getRecommendations(),
        ]);

      setSummary(summaryData);
      setProgress(progressData);
      setActivities(activityData.data);
      setCertificates(certData);
      setRecommendations(recsData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState onRetry={fetchData} />;

  const activeCourses = progress.filter((p) => p.progress < 100).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* ── Welcome Section ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Selamat datang, {user?.name} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {summary?.completedCourses ?? 0} dari {summary?.totalCourses ?? 0}{" "}
          kursus telah diselesaikan. Terus semangat belajar!
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Total Kursus"
          value={summary?.totalCourses ?? 0}
          color="text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Kursus Selesai"
          value={summary?.completedCourses ?? 0}
          color="text-emerald-600"
        />
        <StatCard
          icon={Trophy}
          label="Rata-rata Quiz"
          value={summary?.avgQuizScore ? `${summary.avgQuizScore}%` : "—"}
          color="text-amber-600"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Project Disetujui"
          value={summary?.approvedProjects ?? 0}
          color="text-violet-600"
        />
      </div>

      {/* ── Progress Overview ── */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Progress Pembelajaran
          </CardTitle>
          <Link href="/student/dashboard/analytics">
            <Button variant="ghost" size="sm" className="gap-1 text-sm">
              Lihat Detail
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {progress.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Belum ada kursus yang diikuti.
            </p>
          ) : (
            <div className="space-y-5">
              {progress.map((cp) => (
                <div key={cp.courseId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cp.title}</span>
                    <span className="text-muted-foreground">
                      {cp.completedModules}/{cp.totalModules} modul •{" "}
                      {cp.progress}%
                    </span>
                  </div>
                  <Progress value={cp.progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Active Courses + Activity ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Courses */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Kursus Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCourses.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center">
                Semua kursus telah diselesaikan! 🎉
              </p>
            ) : (
              <div className="space-y-4">
                {activeCourses.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{course.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress
                          value={course.progress}
                          className="h-1.5 w-24"
                        />
                        <span className="text-muted-foreground text-xs">
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                    <Link href={`/learning/${course.courseId}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4 gap-1"
                      >
                        Lanjutkan
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Aktivitas Terbaru
            </CardTitle>
            <Link href="/student/dashboard/activity">
              <Button variant="ghost" size="sm" className="gap-1 text-sm">
                Semua
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center">
                Belum ada aktivitas.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                  >
                    <div
                      className={`mt-0.5 rounded-full p-1.5 ${
                        act.type === "quiz"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : act.type === "project"
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {act.type === "quiz" ? (
                        <Trophy className="h-3.5 w-3.5" />
                      ) : act.type === "project" ? (
                        <ClipboardCheck className="h-3.5 w-3.5" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{act.title}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {act.courseName}
                      </p>
                    </div>
                    <Badge
                      variant={
                        act.status === "Lulus" || act.status === "LULUS"
                          ? "default"
                          : act.status === "PENDING"
                            ? "secondary"
                            : "outline"
                      }
                      className="shrink-0 text-xs"
                    >
                      {act.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Certificates + Recommendations ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Certificates */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5" />
              Sertifikat Terbaru
            </CardTitle>
            <Link href="/student/dashboard/certificates">
              <Button variant="ghost" size="sm" className="gap-1 text-sm">
                Semua
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {certificates.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center">
                Belum ada sertifikat. Selesaikan kursus untuk mendapatkan
                sertifikat.
              </p>
            ) : (
              <div className="space-y-3">
                {certificates.slice(0, 3).map((cert) => (
                  <Link
                    key={cert.id}
                    href={`/certificates/${cert.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {cert.course.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {cert.serialNumber}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {new Date(cert.issuedAt).toLocaleDateString("id-ID")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Rekomendasi Kursus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center">
                Tidak ada rekomendasi saat ini.
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/courses/${rec.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {rec.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {rec.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.level}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
