import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DashboardSummary,
  CourseProgress,
  ActivityItem,
  ActivityResponse,
  DashboardCertificate,
  CourseRecommendation,
} from "@/types/student-dashboard";

export const studentDashboardService = {
  getSummary: async () => {
    const { data } = await api.get<ApiResponse<DashboardSummary>>(
      "/student/dashboard/summary",
    );
    return data.data;
  },

  getProgress: async () => {
    const { data } = await api.get<ApiResponse<CourseProgress[]>>(
      "/student/dashboard/progress",
    );
    return data.data;
  },

  getActivity: async (page: number = 1, limit: number = 10) => {
    const { data } = await api.get<{
      success: boolean;
      data: ActivityItem[];
      pagination: ActivityResponse["pagination"];
    }>("/student/dashboard/activity", {
      params: { page, limit },
    });
    return data;
  },

  getCertificates: async () => {
    const { data } = await api.get<ApiResponse<DashboardCertificate[]>>(
      "/student/dashboard/certificates",
    );
    return data.data;
  },

  getRecommendations: async () => {
    const { data } = await api.get<ApiResponse<CourseRecommendation[]>>(
      "/student/dashboard/recommendations",
    );
    return data.data;
  },
};
