import api from "@/lib/axios";
import {
  Module,
  CreateModuleData,
  UpdateModuleData,
  CreateLessonData,
  UpdateLessonData,
  Lesson,
} from "@/types/module";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const moduleService = {
  // Create Module
  createModule: async (data: CreateModuleData) => {
    const response = await api.post<ApiResponse<Module>>("/modules", data);
    return response.data.data;
  },

  // Update Module
  updateModule: async (id: string, data: UpdateModuleData) => {
    const response = await api.put<ApiResponse<Module>>(`/modules/${id}`, data);
    return response.data.data;
  },

  // Delete Module
  deleteModule: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/modules/${id}`);
    return response.data;
  },
};

export const lessonService = {
  // Create Lesson
  createLesson: async (data: CreateLessonData) => {
    const response = await api.post<ApiResponse<Lesson>>("/lessons", data);
    return response.data.data;
  },

  // Update Lesson
  updateLesson: async (id: string, data: UpdateLessonData) => {
    const response = await api.put<ApiResponse<Lesson>>(`/lessons/${id}`, data);
    return response.data.data;
  },

  // Delete Lesson
  deleteLesson: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/lessons/${id}`);
    return response.data;
  },

  // Get Lesson
  getLesson: async (id: string) => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return response.data.data;
  },
};
