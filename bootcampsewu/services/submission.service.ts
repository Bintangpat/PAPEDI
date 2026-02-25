import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Submission {
  id: string;
  userId: string;
  courseId: string;
  projectId: string;
  githubUrl: string;
  demoUrl?: string | null;
  status: "PENDING" | "REVISI" | "LULUS";
  score?: number | null;
  feedback?: string | null;
  isPassed: boolean;
  reviewedBy?: string | null;
  submittedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  course: {
    title: string;
  };
  project?: {
    id: string;
    title: string;
    passingScore: number;
  } | null;
}

export interface GradeSubmissionData {
  status: "REVISI" | "LULUS";
  feedback: string;
  score?: number | null;
}

interface SubmissionsResponse {
  success: boolean;
  data: Submission[];
}

interface GradeResponse {
  success: boolean;
  message: string;
  data: Submission;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const submissionService = {
  /** Get all submissions for mentor */
  getMentorSubmissions: async (status?: string): Promise<Submission[]> => {
    const params = status ? { status } : {};
    const { data } = await api.get<SubmissionsResponse>("/mentor/submissions", {
      params,
    });
    return data.data;
  },

  /** Get a single submission by ID */
  getSubmissionById: async (id: string): Promise<Submission | undefined> => {
    const { data } = await api.get<SubmissionsResponse>("/mentor/submissions");
    return data.data.find((s) => s.id === id);
  },

  /** Grade a submission */
  gradeSubmission: async (
    submissionId: string,
    gradeData: GradeSubmissionData,
  ): Promise<GradeResponse> => {
    const { data } = await api.post<GradeResponse>(
      `/mentor/submissions/${submissionId}/grade`,
      gradeData,
    );
    return data;
  },
};
