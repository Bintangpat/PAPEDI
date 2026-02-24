"use client";

import { useQuery } from "@tanstack/react-query";
import { enrollmentService } from "@/services/enrollment.service";
import { useAuth } from "@/context/AuthContext";
import { EnrolledCourseCard } from "@/components/enrolled-course-card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: enrollmentService.getMyEnrollments,
    enabled: isAuthenticated,
  });

  if (isAuthLoading || isLoading) {
    return (
      <div className="container space-y-6 py-10">
        <h1 className="text-3xl font-bold">Dashboard Belajar</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null; // Will redirect

  return (
    <div className="container space-y-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Belajar
          </h1>
          <p className="text-muted-foreground mt-2">
            Selamat datang kembali, {user?.name}! Lanjutkan progres belajar
            Anda.
          </p>
        </div>
        <Link href="/courses">
          <Button variant="outline">Jelajahi Kursus Lain</Button>
        </Link>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">
            Anda belum mendaftar kursus apapun
          </h3>
          <p className="text-muted-foreground mb-4">
            Mulai perjalanan belajar Anda dengan mendaftar di kursus yang
            tersedia.
          </p>
          <Link href="/courses">
            <Button>Lihat Katalog Kursus</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {enrollments.map((enrollment: any) => (
            <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
