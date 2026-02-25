import api from "@/lib/axios";
import { Certificate, CertificateTemplate, TextBlock } from "@/types/course";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

// ========================
// Public / Student
// ========================

export const certificateService = {
  // Get public certificate (by ID, serial number, or verification token)
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

  // ========================
  // Admin — Templates
  // ========================

  adminGetTemplates: async (): Promise<CertificateTemplate[]> => {
    const response = await api.get<ApiResponse<CertificateTemplate[]>>(
      "/certificates/admin/templates",
    );
    return response.data.data;
  },

  adminGetTemplate: async (courseId: string): Promise<CertificateTemplate> => {
    const response = await api.get<ApiResponse<CertificateTemplate>>(
      `/certificates/admin/templates/${courseId}`,
    );
    return response.data.data;
  },

  adminCreateTemplate: async (data: {
    courseId: string;
    name: string;
    bgImageUrl?: string | null;
    textBlocks?: TextBlock[];
  }): Promise<CertificateTemplate> => {
    const response = await api.post<ApiResponse<CertificateTemplate>>(
      "/certificates/admin/templates",
      data,
    );
    return response.data.data;
  },

  adminUpdateTemplate: async (
    courseId: string,
    data: {
      name?: string;
      bgImageUrl?: string | null;
      textBlocks?: TextBlock[];
    },
  ): Promise<CertificateTemplate> => {
    const response = await api.put<ApiResponse<CertificateTemplate>>(
      `/certificates/admin/templates/${courseId}`,
      data,
    );
    return response.data.data;
  },

  // ========================
  // Admin — Certificates
  // ========================

  adminGetCourseCertificates: async (
    courseId: string,
  ): Promise<Certificate[]> => {
    const response = await api.get<ApiResponse<Certificate[]>>(
      `/certificates/admin/course/${courseId}`,
    );
    return response.data.data;
  },

  adminRevokeCertificate: async (id: string): Promise<Certificate> => {
    const response = await api.patch<ApiResponse<Certificate>>(
      `/certificates/admin/${id}/revoke`,
    );
    return response.data.data;
  },

  // ========================
  // Upload
  // ========================

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post<ApiResponse<UploadResult>>(
      "/upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data.url;
  },
};
