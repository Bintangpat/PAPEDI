"use client";

import { useState } from "react";
import Link from "next/link";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

// Hooks & Types
import { useAdminCourses } from "@/hooks/use-course";
import { Course } from "@/types/course";

export default function AdminCoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date_desc");

  const { data, isLoading, isError } = useAdminCourses({ page, search, sort });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center text-red-500">
        Terjadi kesalahan saat memuat data kursus.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Kursus
          </h2>
          <p className="text-muted-foreground">
            Kelola daftar kursus, modul, dan materi pembelajaran.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/create">
            <Plus className="mr-2 h-4 w-4" />
            Buat Kursus Baru
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Cari kursus..."
            className="pl-8"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <Select
          value={sort}
          onValueChange={(val) => {
            setSort(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Terbaru</SelectItem>
            <SelectItem value="date_asc">Terlama</SelectItem>
            <SelectItem value="alpha_asc">Nama (A-Z)</SelectItem>
            <SelectItem value="alpha_desc">Nama (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul Kursus</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-12" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  Tidak ada kursus ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((course: Course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    {course.title}
                    <div className="text-muted-foreground max-w-[260px] truncate text-xs">
                      {course.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        course.isPublished
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && data?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Menampilkan{" "}
            <span className="text-foreground font-medium">{data.count}</span>{" "}
            dari{" "}
            <span className="text-foreground font-medium">
              {data.pagination.total}
            </span>{" "}
            kursus &mdash; Halaman {data.pagination.page} dari{" "}
            {data.pagination.pages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(data.pagination?.pages ?? 1, p + 1))
              }
              disabled={page >= (data.pagination?.pages ?? 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
