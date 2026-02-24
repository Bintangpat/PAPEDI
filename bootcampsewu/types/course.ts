import { Module } from "./module";

export enum CourseCategory {
  WEBDEV = "WEBDEV",
  SEO = "SEO",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
}

export enum CourseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  thumbnail?: string | null;
  rating: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    name: string;
    avatar?: string | null;
    bio?: string | null;
  };
  _count?: {
    modules: number;
    enrollments: number;
  };
  modules?: Module[];
}

export interface CreateCourseData {
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  thumbnail?: string;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  isPublished?: boolean;
}
