import Papa from 'papaparse';
import { CSVData, ColumnMapping, DashboardData, PersonStats, ProjectStats } from '@/types';

export function parseCSV(file: File): Promise<CSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        resolve({ headers, rows });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function calculateDashboardData(
  csvData: CSVData,
  mapping: ColumnMapping,
  sprintDays: number = 15
): DashboardData {
  const { rows } = csvData;

  // Capacidade padrão: 80 horas por sprint de 15 dias
  const capacityPerDay = 80 / 15;
  const totalCapacity = capacityPerDay * sprintDays;

  // Map para armazenar stats por pessoa
  const personStatsMap = new Map<string, {
    totalHours: number;
    tasksCompleted: number;
    totalTasks: number;
  }>();

  // Map para armazenar stats por projeto
  const projectStatsMap = new Map<string, {
    totalTasks: number;
    completedTasks: number;
  }>();

  let totalHours = 0;
  let totalTasks = 0;
  let completedTasks = 0;

  rows.forEach((row) => {
    // Processar pessoa
    const assignee = mapping.assignee ? (row[mapping.assignee] || 'Não atribuído').trim() : 'Não atribuído';

    // Processar horas
    const hoursStr = mapping.hours ? row[mapping.hours] : '0';
    const hours = parseFloat(hoursStr) || 0;

    // Processar status
    const status = mapping.status ? (row[mapping.status] || '').toLowerCase().trim() : '';
    const isCompleted = status.includes('complete') ||
                       status.includes('concluído') ||
                       status.includes('done') ||
                       status.includes('fechado') ||
                       status.includes('closed');

    // Processar projeto (pode vir de tags ou campo específico)
    let project = 'Sem projeto';
    if (mapping.project) {
      project = (row[mapping.project] || 'Sem projeto').trim();
    } else if (mapping.tags) {
      const tags = row[mapping.tags] || '';
      // Pega a primeira tag como projeto
      const firstTag = tags.split(',')[0]?.trim();
      if (firstTag) project = firstTag;
    }

    // Atualizar stats de pessoa
    if (!personStatsMap.has(assignee)) {
      personStatsMap.set(assignee, {
        totalHours: 0,
        tasksCompleted: 0,
        totalTasks: 0,
      });
    }
    const personStats = personStatsMap.get(assignee)!;
    personStats.totalHours += hours;
    personStats.totalTasks += 1;
    if (isCompleted) personStats.tasksCompleted += 1;

    // Atualizar stats de projeto
    if (!projectStatsMap.has(project)) {
      projectStatsMap.set(project, {
        totalTasks: 0,
        completedTasks: 0,
      });
    }
    const projectStats = projectStatsMap.get(project)!;
    projectStats.totalTasks += 1;
    if (isCompleted) projectStats.completedTasks += 1;

    // Totais gerais
    totalHours += hours;
    totalTasks += 1;
    if (isCompleted) completedTasks += 1;
  });

  // Converter maps para arrays
  const personStats: PersonStats[] = Array.from(personStatsMap.entries()).map(
    ([name, stats]) => ({
      name,
      totalHours: stats.totalHours,
      tasksCompleted: stats.tasksCompleted,
      totalTasks: stats.totalTasks,
      capacityUsage: (stats.totalHours / totalCapacity) * 100,
    })
  );

  const projectStats: ProjectStats[] = Array.from(projectStatsMap.entries()).map(
    ([name, stats]) => ({
      name,
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks,
      completionPercentage: stats.totalTasks > 0
        ? (stats.completedTasks / stats.totalTasks) * 100
        : 0,
    })
  );

  // Ordenar por horas (mais para menos)
  personStats.sort((a, b) => b.totalHours - a.totalHours);

  // Ordenar projetos por % conclusão
  projectStats.sort((a, b) => b.completionPercentage - a.completionPercentage);

  return {
    personStats,
    projectStats,
    totalHours,
    totalTasks,
    completedTasks,
  };
}

export function getTopPerformers(personStats: PersonStats[], count: number = 5): PersonStats[] {
  return [...personStats]
    .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
    .slice(0, count);
}

export function getLowPerformers(personStats: PersonStats[], count: number = 5): PersonStats[] {
  return [...personStats]
    .sort((a, b) => a.tasksCompleted - b.tasksCompleted)
    .slice(0, count);
}
