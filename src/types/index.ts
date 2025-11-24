export interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
}

export interface ColumnMapping {
  assignee?: string;
  hours?: string;
  estimatedHours?: string;
  status?: string;
  project?: string;
  tags?: string;
  date?: string;
  taskName?: string;
}

export interface Task {
  name: string;
  estimatedHours: number;
  actualHours: number;
  status: string;
  isCompleted: boolean;
  project: string;
  date?: string;
}

export interface PersonStats {
  name: string;
  totalHours: number;
  estimatedHours: number;
  tasksCompleted: number;
  totalTasks: number;
  capacityUsage: number; // percentage
  isIntern?: boolean; // Marca se é estagiário (capacidade 40h)
  tasks?: Task[]; // Lista de tarefas da pessoa
}

export interface ProjectStats {
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  estimatedHours: number;
  actualHours: number;
}

export interface DashboardData {
  personStats: PersonStats[];
  projectStats: ProjectStats[];
  totalHours: number;
  totalTasks: number;
  completedTasks: number;
  tasksByProject: Map<string, any[]>; // Mapa de projeto -> tarefas
}
