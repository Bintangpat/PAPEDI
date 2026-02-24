import api from "@/lib/axios";

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  serialNumber: string;
  issuedAt: string;
  user: {
    name: string;
    email: string;
  };
  course: {
    title: string;
    description: string;
    createdBy: string;
  };
  instructorName?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const certificateService = {
  // Get public certificate
  getCertificate: async (id: string) => {
    const response = await api.get<ApiResponse<Certificate>>(
      `/certificates/${id}`,
    );
    return response.data.data;
  },

  // Generate certificate (Student)
  generateCertificate: async (courseId: string) => {
    const response = await api.post<ApiResponse<Certificate>>("/certificates", {
      courseId,
    });
    return response.data;
  },
};
