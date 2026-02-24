import api from "@/lib/axios";
import { Course, CreateCourseData, UpdateCourseData } from "@/types/course";
import { ApiResponse, PaginatedResponse } from "@/types/api";

// ─── Parameter Types ──────────────────────────────────────────────────────────

export interface PublicCourseParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  level?: string;
}

export interface AdminCourseParams {
  page: number;
  limit: number;
  sort?: string;
  search?: string;
}

// ─── Public Course Service ────────────────────────────────────────────────────
// Mengambil kursus yang sudah dipublikasi saja (untuk halaman publik)

export const publicCourseService = {
  /** GET /courses — hanya kursus published, dengan filter & pagination */
  getAll: async (params?: PublicCourseParams) => {
    const { data } = await api.get<PaginatedResponse<Course>>("/courses", {
      params,
    });
    return data;
  },

  /** GET /courses/:id */
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return data.data;
  },
};

// ─── Admin Course Service ─────────────────────────────────────────────────────
// Mengambil semua kursus (published & draft) untuk halaman admin

export const adminCourseService = {
  /** GET /courses/admin — semua kursus termasuk draft, limit 25 per halaman */
  getAll: async (params: AdminCourseParams) => {
    const { data } = await api.get<PaginatedResponse<Course>>(
      "/courses/admin",
      { params },
    );
    return data;
  },

  /** GET /courses/me — kursus milik mentor yang sedang login */
  getMyCourses: async () => {
    const { data } = await api.get<ApiResponse<Course[]>>("/courses/me");
    return data.data;
  },

  /** POST /courses */
  create: async (courseData: CreateCourseData) => {
    const { data } = await api.post<ApiResponse<Course>>(
      "/courses",
      courseData,
    );
    return data.data;
  },

  /** PUT /courses/:id */
  update: async (id: string, courseData: UpdateCourseData) => {
    const { data } = await api.put<ApiResponse<Course>>(
      `/courses/${id}`,
      courseData,
    );
    return data.data;
  },

  /** DELETE /courses/:id */
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/courses/${id}`);
    return data;
  },
};

// ─── Backward-compat alias ────────────────────────────────────────────────────
// Ekspor courseService agar file lain yang belum diperbarui tidak error

export const courseService = {
  getMyCourses: adminCourseService.getMyCourses,
  getAllCourses: publicCourseService.getAll,
  getAllCoursesAdmin: adminCourseService.getAll,
  getCourseById: publicCourseService.getById,
  createCourse: adminCourseService.create,
  updateCourse: adminCourseService.update,
  deleteCourse: adminCourseService.delete,
};
