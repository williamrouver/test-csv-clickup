export interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
}

export interface ColumnMapping {
  assignee?: string;
  hours?: string;
  status?: string;
  project?: string;
  tags?: string;
  date?: string;
  taskName?: string;
}

export interface PersonStats {
  name: string;
  totalHours: number;
  tasksCompleted: number;
  totalTasks: number;
  capacityUsage: number; // percentage
}

export interface ProjectStats {
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface DashboardData {
  personStats: PersonStats[];
  projectStats: ProjectStats[];
  totalHours: number;
  totalTasks: number;
  completedTasks: number;
}
