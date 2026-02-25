export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "mentor" | "admin";
  avatar?: string;
  bio?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  moduleId: string;
  order: number;
  type: "TEXT" | "VIDEO" | "QUIZ";
  content?: string;
  videoUrl?: string;
  duration?: number;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  courseId: string;
  order: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: "WEBDEV" | "SEO" | "SOCIAL_MEDIA";
  thumbnail?: string;
  isPublished: boolean;
  creatorId: string;
  creator: User;
  modules: Module[];
  _count: {
    modules: number;
    lessons: number;
    enrollments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}
