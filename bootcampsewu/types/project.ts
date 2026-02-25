export interface Project {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  passingScore: number;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  moduleId: string;
  title: string;
  description: string;
  passingScore?: number;
  deadline?: Date | string;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  passingScore?: number;
  deadline?: Date | string | null;
}
