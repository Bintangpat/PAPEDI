import { CourseCategory, CourseLevel } from "./course";

// ─── Survey Form Data ─────────────────────────────────────────────────────────

export interface SurveyFormData {
  q1Goal: string; // Step 1: Tujuan Utama ("1"-"5")
  q2Interest: string; // Step 2: Minat Aktivitas ("1"-"5")
  q3Experience: string; // Step 3: Tingkat Pengalaman ("1"-"4")
  q4Result: string; // Step 4: Fokus Hasil ("1"-"4")
  q5Style: string; // Step 5: Gaya Kerja ("1"-"4")
}

// ─── Survey Result ────────────────────────────────────────────────────────────

export interface SurveyScoreBreakdown {
  WEBDEV: number;
  SEO: number;
  SOCIAL_MEDIA: number;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  thumbnail?: string | null;
  rating: number;
}

export interface SurveyResult {
  surveyId: string;
  recommendedCategory: CourseCategory;
  recommendedLevel: CourseLevel;
  scoreBreakdown: SurveyScoreBreakdown;
  recommendedCourses: RecommendedCourse[];
  completedAt?: string;
}

export interface SurveySubmitResponse {
  success: boolean;
  message: string;
  data: SurveyResult;
}

export interface SurveyResultResponse {
  success: boolean;
  hasSurvey: boolean;
  data: SurveyResult | null;
}

// ─── Survey Step Config ───────────────────────────────────────────────────────

export interface SurveyOption {
  value: string;
  label: string;
}

export interface SurveyStepConfig {
  id: number;
  title: string;
  question: string;
  fieldName: keyof SurveyFormData;
  options: SurveyOption[];
}

// Survey steps configuration berdasarkan bobotsurvey.md
export const SURVEY_STEPS: SurveyStepConfig[] = [
  {
    id: 1,
    title: "Tujuan Utama",
    question: "Apa tujuan utama kamu mengikuti pelatihan ini?",
    fieldName: "q1Goal",
    options: [
      {
        value: "1",
        label: "Saya ingin bisa membuat dan mengelola website sendiri",
      },
      {
        value: "2",
        label: "Saya ingin meningkatkan traffic dan ranking website di Google",
      },
      {
        value: "3",
        label:
          "Saya ingin mengembangkan bisnis atau personal branding melalui media sosial",
      },
      {
        value: "4",
        label: "Saya ingin membuka jasa digital (freelance/agency)",
      },
      {
        value: "5",
        label: "Saya masih eksplorasi dan ingin mencoba bidang yang cocok",
      },
    ],
  },
  {
    id: 2,
    title: "Minat Aktivitas",
    question: "Aktivitas mana yang paling menarik untuk kamu lakukan?",
    fieldName: "q2Interest",
    options: [
      { value: "1", label: "Mendesain dan membangun tampilan website" },
      {
        value: "2",
        label: "Mengoptimasi website agar muncul di halaman pertama Google",
      },
      { value: "3", label: "Membuat konten dan mengelola akun media sosial" },
      {
        value: "4",
        label: "Menganalisis performa website dan data pengunjung",
      },
      { value: "5", label: "Mengelola campaign promosi online" },
    ],
  },
  {
    id: 3,
    title: "Tingkat Pengalaman",
    question: "Seberapa pengalaman kamu saat ini?",
    fieldName: "q3Experience",
    options: [
      { value: "1", label: "Pemula (belum pernah belajar sebelumnya)" },
      { value: "2", label: "Pernah mencoba belajar secara otodidak" },
      { value: "3", label: "Sudah pernah membuat project kecil" },
      {
        value: "4",
        label: "Sudah pernah bekerja atau mengelola bisnis digital",
      },
    ],
  },
  {
    id: 4,
    title: "Fokus Hasil",
    question:
      "Hasil apa yang paling ingin kamu capai dalam 3–6 bulan ke depan?",
    fieldName: "q4Result",
    options: [
      {
        value: "1",
        label: "Memiliki website profesional yang berjalan dengan baik",
      },
      { value: "2", label: "Website saya muncul di halaman pertama Google" },
      {
        value: "3",
        label:
          "Akun media sosial saya tumbuh dan menghasilkan engagement tinggi",
      },
      { value: "4", label: "Mendapatkan klien dari layanan digital" },
    ],
  },
  {
    id: 5,
    title: "Gaya Kerja",
    question: "Kamu lebih nyaman bekerja dengan tipe aktivitas seperti apa?",
    fieldName: "q5Style",
    options: [
      { value: "1", label: "Coding dan membangun sistem" },
      { value: "2", label: "Analisis data dan optimasi performa" },
      { value: "3", label: "Kreatif membuat konten dan visual" },
      { value: "4", label: "Strategi pemasaran dan campaign" },
    ],
  },
];

// Category display labels
export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  [CourseCategory.WEBDEV]: "Web Development",
  [CourseCategory.SEO]: "SEO & Analytics",
  [CourseCategory.SOCIAL_MEDIA]: "Social Media Marketing",
};

export const CATEGORY_DESCRIPTIONS: Record<CourseCategory, string> = {
  [CourseCategory.WEBDEV]:
    "Kamu cocok untuk belajar membangun dan mengembangkan website dari dasar hingga production.",
  [CourseCategory.SEO]:
    "Kamu cocok untuk belajar mengoptimasi website agar tampil di halaman pertama mesin pencari.",
  [CourseCategory.SOCIAL_MEDIA]:
    "Kamu cocok untuk belajar mengelola dan mengembangkan bisnis melalui media sosial.",
};
