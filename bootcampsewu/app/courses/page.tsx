"use client";

import { useState } from "react";
import { usePublicCourses } from "@/hooks/use-course";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseCategory, CourseLevel } from "@/types/course";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [level, setLevel] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = usePublicCourses({
    search: debouncedSearch || undefined,
    category,
    level,
    limit: 12,
  });

  const clearFilters = () => {
    setSearch("");
    setCategory(undefined);
    setLevel(undefined);
  };

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Katalog Kursus</h1>
        <p className="text-muted-foreground text-lg">
          Jelajahi berbagai materi pembelajaran untuk meningkatkan Anda.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
          <Input
            placeholder="Cari kursus..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={category ?? "ALL"}
            onValueChange={(val) =>
              setCategory(val === "ALL" ? undefined : val)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              <SelectItem value={CourseCategory.WEBDEV}>
                Web Development
              </SelectItem>
              <SelectItem value={CourseCategory.SEO}>Simple SEO</SelectItem>
              <SelectItem value={CourseCategory.SOCIAL_MEDIA}>
                Social Media
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={level ?? "ALL"}
            onValueChange={(val) => setLevel(val === "ALL" ? undefined : val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Level</SelectItem>
              <SelectItem value={CourseLevel.BEGINNER}>Pemula</SelectItem>
              <SelectItem value={CourseLevel.INTERMEDIATE}>Menengah</SelectItem>
              <SelectItem value={CourseLevel.ADVANCED}>Mahir</SelectItem>
            </SelectContent>
          </Select>

          {(search || category || level) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              title="Reset filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-red-500">
          Gagal memuat kursus. Silakan coba lagi.
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">Tidak ada kursus ditemukan</h3>
          <p className="text-muted-foreground mt-1">
            Coba ubah kata kunci pencarian atau filter Anda.
          </p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
