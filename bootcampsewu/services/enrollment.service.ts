import api from "@/lib/axios";

interface EnrollmentResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface CheckEnrollmentResponse {
  success: boolean;
  isEnrolled: boolean;
  data?: any;
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
    const { data } = await api.get<EnrollmentResponse>("/enrollments/me");
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
