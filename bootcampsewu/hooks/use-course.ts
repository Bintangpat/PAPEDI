import { useQuery } from "@tanstack/react-query";
import {
  publicCourseService,
  adminCourseService,
  PublicCourseParams,
} from "@/services/course.service";

// ─── Admin Hook ───────────────────────────────────────────────────────────────

export interface UseAdminCoursesParams {
  page: number;
  search: string;
  sort: string;
}

/** Semua kursus (published & draft) untuk halaman admin, 25 per halaman */
export const useAdminCourses = (params: UseAdminCoursesParams) => {
  return useQuery({
    queryKey: ["admin-courses", params],
    queryFn: () =>
      adminCourseService.getAll({
        page: params.page,
        limit: 25,
        search: params.search || undefined,
        sort: params.sort,
      }),
    placeholderData: (prev) => prev,
  });
};

// ─── Mentor Hook ──────────────────────────────────────────────────────────────

/** Kursus milik mentor yang sedang login */
export const useMentorCourses = () => {
  return useQuery({
    queryKey: ["mentor-courses"],
    queryFn: adminCourseService.getMyCourses,
  });
};

// ─── Public Hook ─────────────────────────────────────────────────────────────

export interface UsePublicCoursesParams extends PublicCourseParams {
  search?: string;
  category?: string;
  level?: string;
}

/** Hanya kursus yang sudah published, untuk halaman publik */
export const usePublicCourses = (params?: UsePublicCoursesParams) => {
  return useQuery({
    queryKey: ["public-courses", params],
    queryFn: () => publicCourseService.getAll(params),
    placeholderData: (prev) => prev,
  });
};
