import { Project } from "./project";

export enum LessonType {
  VIDEO = "VIDEO",
  TEXT = "TEXT",
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content?: string | null;
  videoUrl?: string | null;
  order: number;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
  project?: Project | null;
  quiz?: {
    id: string;
    passingScore: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleData {
  title: string;
  courseId: string;
  order: number;
}

export interface UpdateModuleData {
  title?: string;
  order?: number;
}

export interface CreateLessonData {
  title: string;
  moduleId: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  order: number;
}

export interface UpdateLessonData {
  title?: string;
  type?: LessonType;
  content?: string;
  videoUrl?: string;
  order?: number;
}
