export interface DashboardSummary {
  totalCourses: number;
  completedCourses: number;
  avgQuizScore: number;
  approvedProjects: number;
}

export interface CourseProgress {
  courseId: string;
  title: string;
  thumbnail: string | null;
  progress: number;
  totalModules: number;
  completedModules: number;
  enrolledAt: string;
}

export interface ActivityItem {
  type: "quiz" | "project" | "enrollment";
  title: string;
  courseName: string;
  date: string;
  status: string;
}

export interface ActivityResponse {
  data: ActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardCertificate {
  id: string;
  userId: string;
  courseId: string;
  serialNumber: string;
  issuedAt: string;
  course: {
    title: string;
    description: string;
  };
}

export interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string | null;
  rating: number;
  creator: {
    name: string;
  };
}
