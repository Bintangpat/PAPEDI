"use client";

import { useEffect, useState } from "react";
import { studentDashboardService } from "@/services/student-dashboard.service";
import { ActivityItem, ActivityResponse } from "@/types/student-dashboard";
import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  Clock,
  RefreshCcw,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ActivityPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pagination, setPagination] = useState<
    ActivityResponse["pagination"] | null
  >(null);
  const [page, setPage] = useState(1);

  const fetchData = async (p: number) => {
    setLoading(true);
    setError(false);
    try {
      const result = await studentDashboardService.getActivity(p, 10);
      setActivities(result.data);
      setPagination(result.pagination);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <Trophy className="h-4 w-4" />;
      case "project":
        return <ClipboardCheck className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "quiz":
        return "Quiz";
      case "project":
        return "Project";
      case "enrollment":
        return "Enrollment";
      default:
        return type;
    }
  };

  const getStatusVariant = (status: string) => {
    if (status === "Lulus" || status === "LULUS") return "default" as const;
    if (status === "PENDING") return "secondary" as const;
    if (status === "REVISI") return "destructive" as const;
    return "outline" as const;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-red-600">Gagal memuat data</p>
        <Button
          variant="outline"
          onClick={() => fetchData(page)}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Riwayat Aktivitas</h1>
        <p className="text-muted-foreground">
          Semua aktivitas pembelajaran Anda.
        </p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {activities.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="text-muted-foreground mx-auto h-10 w-10" />
              <p className="text-muted-foreground mt-3">
                Belum ada aktivitas tercatat.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Tanggal</TableHead>
                  <TableHead className="w-[120px]">Jenis</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Kursus</TableHead>
                  <TableHead className="w-[100px] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((act, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(act.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {getTypeIcon(act.type)}
                        {getTypeLabel(act.type)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{act.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {act.courseName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={getStatusVariant(act.status)}
                        className="text-xs"
                      >
                        {act.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Halaman {pagination.page} dari {pagination.totalPages} •{" "}
            {pagination.total} aktivitas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Selanjutnya
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
