import Papa from 'papaparse';
import { CSVData, ColumnMapping, DashboardData, PersonStats, ProjectStats, Task } from '@/types';

// Função auxiliar para converter tempo em diversos formatos para horas decimais
function parseTimeToHours(timeStr: string): number {
  if (!timeStr || timeStr.trim() === '') return 0;

  const str = timeStr.trim();

  // Formato "6h 8m" ou "6h" ou "8m"
  if (str.includes('h') || str.includes('m')) {
    let hours = 0;
    let minutes = 0;

    // Extrair horas (ex: "6h")
    const hoursMatch = str.match(/(\d+)h/);
    if (hoursMatch) {
      hours = parseInt(hoursMatch[1]) || 0;
    }

    // Extrair minutos (ex: "8m")
    const minutesMatch = str.match(/(\d+)m/);
    if (minutesMatch) {
      minutes = parseInt(minutesMatch[1]) || 0;
    }

    return hours + (minutes / 60);
  }

  // Formato "HH:MM" ou "H:MM"
  if (str.includes(':')) {
    const parts = str.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    return hours + (minutes / 60);
  }

  // Caso contrário, tenta converter como número decimal (substituindo vírgula por ponto)
  return parseFloat(str.replace(',', '.')) || 0;
}

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
  sprintDays: number = 15,
  internNames: Set<string> = new Set()
): DashboardData {
  const { rows } = csvData;

  // Função para obter capacidade baseado se é estagiário ou não
  const getCapacity = (personName: string) => {
    const capacity = internNames.has(personName) ? 40 : 80;
    return (capacity / 15) * sprintDays;
  };

  // Map para armazenar stats por pessoa
  const personStatsMap = new Map<string, {
    totalHours: number;
    estimatedHours: number;
    tasksCompleted: number;
    tasksOpen: number;
    totalTasks: number;
    tasks: Task[];
  }>();

  // Map para armazenar stats por projeto
  const projectStatsMap = new Map<string, {
    totalTasks: number;
    completedTasks: number;
    openTasks: number;
    estimatedHours: number;
    actualHours: number;
  }>();

  // Map para armazenar tarefas por projeto
  const tasksByProject = new Map<string, any[]>();

  let totalHours = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  let openTasks = 0;

  rows.forEach((row) => {
    // Processar pessoa
    let assignee = mapping.assignee ? (row[mapping.assignee] || 'Não atribuído').trim() : 'Não atribuído';

    // Remover colchetes do início e fim do nome (ex: "[Nome]" -> "Nome")
    assignee = assignee.replace(/^\[|\]$/g, '').trim();

    // Tratar [] como tarefa sem dono
    if (assignee === '' || assignee === '[]') {
      assignee = 'Tarefa sem dono';
    }

    // Processar horas - suporta formato HH:MM ou decimal
    const hoursStr = mapping.hours ? row[mapping.hours] : '0';
    const hours = parseTimeToHours(hoursStr);

    // Processar horas estimadas - suporta formato HH:MM ou decimal
    const estimatedHoursStr = mapping.estimatedHours ? row[mapping.estimatedHours] : '0';
    const estimatedHours = parseTimeToHours(estimatedHoursStr);

    // Processar status
    const status = mapping.status ? (row[mapping.status] || '').toLowerCase().trim() : '';
    // Tarefas são consideradas CONCLUÍDAS apenas se tiverem estes status
    const isCompleted = status.includes('complete') ||
                       status.includes('concluído') ||
                       status.includes('done') ||
                       status.includes('fechado') ||
                       status.includes('closed') ||
                       status.includes('accepted');
    // Tarefas com "to-do", "in progress", etc são consideradas NÃO concluídas

    // Processar projeto (pode vir de tags ou campo específico)
    let project = 'Sem projeto';
    if (mapping.project) {
      const projectValue = (row[mapping.project] || '').trim();
      // Se o projeto contém múltiplos valores separados por vírgula, pega o primeiro
      if (projectValue.includes(',')) {
        const projects = projectValue.split(',').map(p => p.trim());
        project = projects[0] || 'Sem projeto';
      } else {
        project = projectValue || 'Sem projeto';
      }
    } else if (mapping.tags) {
      const tags = row[mapping.tags] || '';
      // Se tem múltiplas tags, pega a primeira
      if (tags.includes(',')) {
        const tagList = tags.split(',').map(t => t.trim());
        project = tagList[0] || 'Sem projeto';
      } else {
        const firstTag = tags.trim();
        project = firstTag || 'Sem projeto';
      }
    }

    // Processar nome da tarefa
    const taskName = mapping.taskName ? (row[mapping.taskName] || 'Sem nome').trim() : 'Sem nome';

    // Processar data
    const date = mapping.date ? row[mapping.date] : undefined;

    // Atualizar stats de pessoa
    if (!personStatsMap.has(assignee)) {
      personStatsMap.set(assignee, {
        totalHours: 0,
        estimatedHours: 0,
        tasksCompleted: 0,
        tasksOpen: 0,
        totalTasks: 0,
        tasks: [],
      });
    }
    const personStats = personStatsMap.get(assignee)!;
    personStats.totalHours += hours;
    personStats.estimatedHours += estimatedHours;
    personStats.totalTasks += 1;
    if (isCompleted) {
      personStats.tasksCompleted += 1;
    } else {
      personStats.tasksOpen += 1;
    }

    // Adicionar tarefa à lista de tarefas da pessoa
    personStats.tasks.push({
      name: taskName,
      estimatedHours,
      actualHours: hours,
      status,
      isCompleted,
      project,
      date,
    });

    // Atualizar stats de projeto
    if (!projectStatsMap.has(project)) {
      projectStatsMap.set(project, {
        totalTasks: 0,
        completedTasks: 0,
        openTasks: 0,
        estimatedHours: 0,
        actualHours: 0,
      });
    }
    const projectStats = projectStatsMap.get(project)!;
    projectStats.totalTasks += 1;
    projectStats.estimatedHours += estimatedHours;
    projectStats.actualHours += hours;
    if (isCompleted) {
      projectStats.completedTasks += 1;
    } else {
      projectStats.openTasks += 1;
    }

    // Armazenar tarefa por projeto
    if (!tasksByProject.has(project)) {
      tasksByProject.set(project, []);
    }
    tasksByProject.get(project)!.push({
      name: taskName,
      assignee,
      hours,
      estimatedHours,
      isCompleted,
      status,
    });

    // Totais gerais
    totalHours += hours;
    totalTasks += 1;
    if (isCompleted) {
      completedTasks += 1;
    } else {
      openTasks += 1;
    }
  });

  // Converter maps para arrays
  const personStats: PersonStats[] = Array.from(personStatsMap.entries()).map(
    ([name, stats]) => {
      const capacity = getCapacity(name);
      const isIntern = internNames.has(name);
      return {
        name,
        totalHours: stats.totalHours,
        estimatedHours: stats.estimatedHours,
        tasksCompleted: stats.tasksCompleted,
        tasksOpen: stats.tasksOpen,
        totalTasks: stats.totalTasks,
        capacityUsage: (stats.totalHours / capacity) * 100,
        isIntern,
        tasks: stats.tasks,
      };
    }
  );

  const projectStats: ProjectStats[] = Array.from(projectStatsMap.entries()).map(
    ([name, stats]) => ({
      name,
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks,
      openTasks: stats.openTasks,
      completionPercentage: stats.totalTasks > 0
        ? (stats.completedTasks / stats.totalTasks) * 100
        : 0,
      estimatedHours: stats.estimatedHours,
      actualHours: stats.actualHours,
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
    openTasks,
    tasksByProject,
  };
}

export function getTopPerformers(personStats: PersonStats[], count: number = 5): PersonStats[] {
  return [...personStats]
    .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
    .slice(0, count);
}

export function getLowPerformers(personStats: PersonStats[], count: number = 5): PersonStats[] {
  return [...personStats]
    .sort((a, b) => a.totalHours - b.totalHours)
    .slice(0, count);
}
