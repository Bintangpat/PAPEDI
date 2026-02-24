import api from "@/lib/axios";
import { Project, CreateProjectData, UpdateProjectData } from "@/types/project";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SubmitProjectData {
  courseId: string;
  projectId: string;
  githubUrl: string;
  demoUrl?: string;
}

export interface ProjectSubmission {
  id: string;
  userId: string;
  courseId: string;
  projectId?: string;
  githubUrl?: string;
  demoUrl?: string;
  status: "PENDING" | "LULUS" | "REVISI";
  feedback?: string;
  submittedAt: string;
  student?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export const projectService = {
  // Create Project
  createProject: async (data: CreateProjectData) => {
    const response = await api.post<ApiResponse<Project>>("/projects", data);
    return response.data.data;
  },

  // Update Project
  updateProject: async (id: string, data: UpdateProjectData) => {
    const response = await api.put<ApiResponse<Project>>(
      `/projects/${id}`,
      data,
    );
    return response.data.data;
  },

  // Delete Project
  deleteProject: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/projects/${id}`);
    return response.data;
  },

  // Get Project
  getProject: async (id: string) => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  // Get Project By Module ID
  getProjectByModuleId: async (moduleId: string) => {
    const response = await api.get<ApiResponse<Project>>(
      `/projects/module/${moduleId}`,
    );
    return response.data.data;
  },

  // Submit Project (Student)
  submitProject: async (data: SubmitProjectData) => {
    const response = await api.post<ApiResponse<ProjectSubmission>>(
      "/projects/submit",
      data,
    );
    return response.data;
  },

  // Get My Submission (Student)
  getMySubmission: async (courseId: string, projectId: string) => {
    const response = await api.get<ApiResponse<ProjectSubmission | null>>(
      `/projects/my`,
      {
        params: { courseId, projectId },
      },
    );
    return response.data.data;
  },

  // Get Project Submissions (Mentor)
  getProjectSubmissions: async (projectId: string) => {
    const response = await api.get<ApiResponse<ProjectSubmission[]>>(
      `/projects/${projectId}/submissions`,
    );
    return response.data.data;
  },

  // Grade Project (Mentor)
  gradeProject: async (
    submissionId: string,
    data: { status: "LULUS" | "REVISI"; feedback: string },
  ) => {
    const response = await api.put<ApiResponse<ProjectSubmission>>(
      `/projects/submissions/${submissionId}`,
      data,
    );
    return response.data.data;
  },
};
