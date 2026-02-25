"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  LayoutTemplate,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import CertificateList from "./_components/certificate-list";
import { useAdminTemplate } from "@/hooks/use-certificate";
import { useAdminCourses } from "@/hooks/use-course";

function TemplateSummary({ courseId }: { courseId: string }) {
  const { data: template, isLoading, isError } = useAdminTemplate(courseId);

  if (isLoading) {
    return <Skeleton className="h-16 w-full rounded-lg" />;
  }

  if (isError || !template) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-300">
              Belum ada template sertifikat
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Buat template agar sertifikat peserta dapat terbentuk dengan
              desain yang kustom.
            </p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/certificates/create">
            <Plus className="mr-1 h-4 w-4" />
            Buat Template
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 dark:bg-green-900/20">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800 dark:text-green-300">
            Template aktif:{" "}
            <span className="font-semibold">{template.name}</span>
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            {template.textBlocks.length} blok teks terdaftar
            {template.bgImageUrl ? " · Gambar background tersedia" : ""}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/certificates/create?courseId=${courseId}`}>
          <LayoutTemplate className="mr-1 h-4 w-4" />
          Edit Template
        </Link>
      </Button>
    </div>
  );
}

export default function AdminCourseCertificatesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data: coursesData } = useAdminCourses({
    page: 1,
    search: "",
    sort: "date_desc",
  });
  const course = coursesData?.data?.find((c: any) => c.id === courseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href="/admin/courses">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Sertifikat Kursus
          </h2>
          <p className="text-muted-foreground mt-1">
            {course ? (
              <>
                <Badge variant="outline" className="mr-2">
                  {course.category}
                </Badge>
                <span className="font-medium">{course.title}</span>
              </>
            ) : (
              "Kelola sertifikat peserta yang telah lulus."
            )}
          </p>
        </div>
      </div>

      {/* Template Status Banner */}
      <TemplateSummary courseId={courseId} />

      {/* Certificate Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Sertifikat Terbit</h3>
        <CertificateList courseId={courseId} />
      </div>
    </div>
  );
}
