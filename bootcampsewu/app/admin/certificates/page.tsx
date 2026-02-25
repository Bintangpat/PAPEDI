"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, LayoutTemplate, Eye, CheckCircle, XCircle } from "lucide-react";
import { useAdminCourses } from "@/hooks/use-course";
import { useAdminTemplates } from "@/hooks/use-certificate";
import { Course } from "@/types/course";
import { CertificateTemplate } from "@/types/course";

export default function AdminCertificatesPage() {
  const { data: coursesData, isLoading: loadingCourses } = useAdminCourses({
    page: 1,
    search: "",
    sort: "date_desc",
  });
  const { data: templates, isLoading: loadingTemplates } = useAdminTemplates();

  const isLoading = loadingCourses || loadingTemplates;
  const courses: Course[] = coursesData?.data ?? [];

  // Build a map of courseId → template
  const templateMap = new Map<string, CertificateTemplate>(
    (templates ?? []).map((t: CertificateTemplate) => [t.courseId, t]),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Sertifikat
          </h2>
          <p className="text-muted-foreground">
            Atur template sertifikat per kursus dan kelola sertifikat peserta.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/certificates/create">
            <Plus className="mr-2 h-4 w-4" />
            Buat Template
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kursus</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-center">Template</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  Tidak ada kursus ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course: Course) => {
                const template = templateMap.get(course.id);
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-muted-foreground max-w-xs truncate text-xs">
                        {course.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{course.level}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {template ? (
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">{template.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-yellow-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">Belum ada</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {template ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/admin/certificates/create?courseId=${course.id}`}
                            >
                              <LayoutTemplate className="mr-1 h-3 w-3" />
                              Edit Template
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/admin/certificates/create?courseId=${course.id}`}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Buat Template
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/certificates/${course.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            Sertifikat
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
