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

export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
  FAILED = "FAILED",
}

export enum ModuleStatus {
  LOCKED = "LOCKED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum CertificateStatus {
  ELIGIBLE = "ELIGIBLE",
  ISSUED = "ISSUED",
  REVOKED = "REVOKED",
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  thumbnail?: string | null;
  rating: number;
  passingScore: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
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
  batches?: Batch[];
}

export interface CreateCourseData {
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  thumbnail?: string;
  passingScore?: number;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  isPublished?: boolean;
}

// Module Progress
export interface ModuleProgressData {
  id: string;
  enrollmentId: string;
  moduleId: string;
  status: ModuleStatus;
  averageQuizScore?: number | null;
  isPassed: boolean;
  module?: {
    id: string;
    title: string;
    order: number;
  };
}

// Enrollment
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  finalScore?: number | null;
  isEligibleCert: boolean;
  enrolledAt: string;
  completedLessons: string[];
  completedQuizzes: string[];
  completedProjects?: string[];
  moduleProgress?: ModuleProgressData[];
  course?: Course;
  progress?: number;
  completedModules?: number;
  totalModules?: number;
}

// Batch
export interface Batch {
  id: string;
  courseId: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  maxStudents?: number | null;
  isActive: boolean;
  createdAt: string;
  course?: { title: string; id: string };
  _count?: { enrollments: number };
}

// Certificate
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  enrollmentId?: string | null;
  serialNumber: string;
  finalScore?: number | null;
  grade?: string | null;
  status?: CertificateStatus;
  verificationToken?: string | null;
  pdfUrl?: string | null;
  issuedAt: string;
  revokedAt?: string | null;
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
  };
  course?: {
    title: string;
    description?: string;
    certificateTemplate?: {
      bgImageUrl?: string | null;
      textBlocks: TextBlock[];
    } | null;
  };
  instructorName?: string;
}

// Certificate Template
export interface TextBlock {
  id: string;
  variable: string; // e.g. "{{studentName}}"
  x: number; // % dari lebar gambar
  y: number; // % dari tinggi gambar
  fontSize: number;
  fontColor: string;
  fontWeight: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
}

export interface CertificateTemplate {
  id: string;
  courseId: string;
  name: string;
  bgImageUrl?: string | null;
  textBlocks: TextBlock[];
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    category: string;
    level: string;
  };
}

// Survey Response
export interface SurveyResponse {
  id: string;
  userId: string;
  q1Goal: string;
  q2Experience: string;
  q3Interest: string;
  q4LearningStyle: string;
  q5TimeCommitment: string;
  recommendedCategory: CourseCategory;
  recommendedLevel: CourseLevel;
  scoreBreakdown: Record<string, number>;
  createdAt: string;
}

// Survey Result (API response)
export interface SurveyResult {
  surveyId: string;
  recommendedCategory: CourseCategory;
  recommendedLevel: CourseLevel;
  scoreBreakdown: Record<string, number>;
  recommendedCourses: Course[];
  completedAt?: string;
}
