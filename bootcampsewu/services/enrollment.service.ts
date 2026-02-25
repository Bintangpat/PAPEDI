import api from "@/lib/axios";
import { Enrollment, ModuleProgressData } from "@/types/course";

interface EnrollmentResponse {
  success: boolean;
  message?: string;
  data?: Enrollment;
}

interface EnrollmentsListResponse {
  success: boolean;
  data: (Enrollment & {
    progress: number;
    completedModules: number;
    totalModules: number;
  })[];
}

interface CheckEnrollmentResponse {
  success: boolean;
  isEnrolled: boolean;
  data?: {
    id: string;
    userId: string;
    courseId: string;
    status: string;
    finalScore?: number | null;
    isEligibleCert: boolean;
    enrolledAt: string;
    completedLessons: string[];
    completedQuizzes: string[];
    completedProjects: string[];
    moduleProgress: ModuleProgressData[];
  };
}

export const enrollmentService = {
  // Enroll in a course
  enroll: async (courseId: string) => {
    const { data } = await api.post<EnrollmentResponse>(
      `/enrollments/${courseId}`,
    );
    return data;
  },

  // Check if enrolled
  checkEnrollment: async (courseId: string) => {
    const { data } = await api.get<CheckEnrollmentResponse>(
      `/enrollments/${courseId}/check`,
    );
    return data;
  },

  // Get my enrollments
  getMyEnrollments: async () => {
    const { data } = await api.get<EnrollmentsListResponse>("/enrollments/me");
    return data.data;
  },

  // Mark lesson as complete
  markLessonComplete: async (courseId: string, lessonId: string) => {
    const { data } = await api.post<EnrollmentResponse>(
      `/enrollments/${courseId}/lessons/${lessonId}/complete`,
    );
    return data;
  },
};
