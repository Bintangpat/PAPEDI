export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  order?: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  passingScore: number;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface UpsertQuizData {
  moduleId: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface SubmitQuizData {
  answers: number[];
}

export interface QuizResult {
  score: number;
  passed: boolean;
  attempt: {
    id: string;
    score: number;
    passed: boolean;
    attemptedAt: string;
  };
}
