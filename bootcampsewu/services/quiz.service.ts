import api from "@/lib/axios";
import { Quiz, UpsertQuizData, QuizResult, SubmitQuizData } from "@/types/quiz";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const quizService = {
  // Get Quiz by Module ID (for Student)
  getQuizByModuleId: async (moduleId: string) => {
    const { data } = await api.get<ApiResponse<Quiz>>(
      `/quiz/module/${moduleId}`,
    );
    return data.data;
  },

  // Get Quiz by ID (Student)
  getQuizById: async (quizId: string) => {
    const { data } = await api.get<ApiResponse<Quiz>>(`/quiz/${quizId}`);
    return data.data;
  },

  // Get Full Quiz for Editor (Mentor)
  getQuizForEditor: async (moduleId: string) => {
    const { data } = await api.get<ApiResponse<Quiz | null>>(
      `/quiz/module/${moduleId}/editor`,
    );
    return data.data;
  },

  // Upsert Quiz (Admin/Mentor)
  upsertQuiz: async (data: UpsertQuizData) => {
    const { data: response } = await api.post<ApiResponse<Quiz>>("/quiz", data);
    return response.data;
  },

  // Submit Quiz (Student)
  submitQuiz: async (quizId: string, data: SubmitQuizData) => {
    const { data: response } = await api.post<ApiResponse<QuizResult>>(
      `/quiz/${quizId}/submit`,
      data,
    );
    return response.data;
  },
};
