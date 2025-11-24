import { useMemo, useState } from 'react';
import { DashboardData, PersonStats } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PersonActivityChart } from '@/components/charts/PersonActivityChart';
import { CapacityChart } from '@/components/charts/CapacityChart';
import { ProjectCompletionChart } from '@/components/charts/ProjectCompletionChart';
import { EstimatedVsActualChart } from '@/components/charts/EstimatedVsActualChart';
import { getTopPerformers, getLowPerformers } from '@/lib/csv-parser';
import { Users, Clock, CheckCircle, TrendingUp, TrendingDown, BarChart3, ArrowUpDown, Filter, Settings, Sun, Moon, FileDown } from 'lucide-react';
import { exportToPDF } from '@/lib/pdf-exporter';
import { Select } from '@/components/ui/select';
import { useEffect } from 'react';
import { InternManager } from '@/components/InternManager';
import { InternBadge } from '@/components/InternBadge';
import { PersonTasksModal } from '@/components/PersonTasksModal';
import { ProjectTasksModal } from '@/components/ProjectTasksModal';
import { AllTasksModal } from '@/components/AllTasksModal';
import { CompletedTasksModal } from '@/components/CompletedTasksModal';
import { ActivePeopleModal } from '@/components/ActivePeopleModal';

interface DashboardProps {
  data: DashboardData;
  onReset: () => void;
  onInternUpdate: (internNames: Set<string>) => void;
}

type SortField = 'name' | 'totalTasks' | 'tasksCompleted' | 'totalHours' | 'completionRate';
type ProjectSortField = 'name' | 'totalTasks' | 'completedTasks' | 'completionPercentage';
type CapacitySortField = 'name' | 'totalHours' | 'capacityUsage';
type SortOrder = 'asc' | 'desc';

export function Dashboard({ data, onReset, onInternUpdate }: DashboardProps) {
  const handleUpdateInterns = (updatedPeople: PersonStats[]) => {
    const internNames = new Set(
      updatedPeople.filter(p => p.isIntern).map(p => p.name)
    );
    onInternUpdate(internNames);
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [sortField, setSortField] = useState<SortField>('totalHours');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [projectSortField, setProjectSortField] = useState<ProjectSortField>('completionPercentage');
  const [projectSortOrder, setProjectSortOrder] = useState<SortOrder>('desc');
  const [capacitySortField, setCapacitySortField] = useState<CapacitySortField>('capacityUsage');
  const [capacitySortOrder, setCapacitySortOrder] = useState<SortOrder>('desc');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [selectedPerson, setSelectedPerson] = useState<PersonStats | null>(null);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [selectedProjectData, setSelectedProjectData] = useState<{ name: string; tasks: any[] } | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAllTasksModalOpen, setIsAllTasksModalOpen] = useState(false);
  const [isCompletedTasksModalOpen, setIsCompletedTasksModalOpen] = useState(false);
  const [isActivePeopleModalOpen, setIsActivePeopleModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 20;

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Reset pagination when filter or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProject, activeTab]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleExportPDF = () => {
    const tabNames: Record<string, string> = {
      overview: 'Visao-Geral',
      people: 'Pessoas',
      projects: 'Projetos',
      tasks: 'Tarefas',
      capacity: 'Capacidade',
      estimated: 'Estimado-vs-Real',
    };
    const fileName = `Dashboard-${tabNames[activeTab]}-${new Date().toISOString().split('T')[0]}.pdf`;
    const elementId = `tab-content-${activeTab}`;
    exportToPDF(elementId, fileName);
  };

  const handlePersonClick = (person: PersonStats) => {
    setSelectedPerson(person);
    setIsPersonModalOpen(true);
  };

  const handleClosePersonModal = () => {
    setIsPersonModalOpen(false);
    setSelectedPerson(null);
  };

  const handleProjectClick = (projectName: string) => {
    const tasks = data.tasksByProject.get(projectName) || [];
    setSelectedProjectData({ name: projectName, tasks });
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProjectData(null);
  };

  // Filtrar dados por projeto selecionado
  const filteredData = useMemo(() => {
    if (selectedProject === 'all') {
      return data;
    }

    // Obter as pessoas que trabalharam no projeto selecionado
    const projectTasks = data.tasksByProject.get(selectedProject) || [];
    const peopleInProject = new Set(projectTasks.map((task: any) => task.assignee));

    // Filtrar personStats para incluir apenas pessoas do projeto
    // E filtrar as tarefas de cada pessoa para incluir apenas tarefas do projeto selecionado
    const filteredPersonStats = data.personStats
      .filter(person => peopleInProject.has(person.name))
      .map(person => {
        // Filtrar apenas as tarefas do projeto selecionado
        const filteredTasks = person.tasks?.filter(task => task.project === selectedProject) || [];

        // Recalcular estatísticas baseadas apenas nas tarefas filtradas
        const totalTasks = filteredTasks.length;
        const tasksCompleted = filteredTasks.filter(t => t.isCompleted).length;
        const totalHours = filteredTasks.reduce((sum, t) => sum + t.actualHours, 0);
        const estimatedHours = filteredTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

        return {
          ...person,
          tasks: filteredTasks,
          totalTasks,
          tasksCompleted,
          totalHours,
          estimatedHours,
          capacityUsage: person.capacity > 0 ? (totalHours / person.capacity) * 100 : 0
        };
      });

    // Filtrar projectStats para incluir apenas o projeto selecionado ou relacionados
    const filteredProjectStats = data.projectStats.filter(project =>
      project.name === selectedProject
    );

    // Recalcular totais baseado nas pessoas filtradas
    const filteredTotalHours = projectTasks.reduce((sum: number, task: any) => sum + task.hours, 0);
    const filteredTotalTasks = projectTasks.length;
    const filteredCompletedTasks = projectTasks.filter((task: any) => task.isCompleted).length;

    return {
      personStats: filteredPersonStats,
      projectStats: filteredProjectStats,
      totalHours: filteredTotalHours,
      totalTasks: filteredTotalTasks,
      completedTasks: filteredCompletedTasks,
      tasksByProject: data.tasksByProject,
    };
  }, [data, selectedProject]);

  const topPerformers = useMemo(() => getTopPerformers(filteredData.personStats, 5), [filteredData.personStats]);
  const lowPerformers = useMemo(() => getLowPerformers(filteredData.personStats, 5), [filteredData.personStats]);

  const completionRate = filteredData.totalTasks > 0
    ? ((filteredData.completedTasks / filteredData.totalTasks) * 100).toFixed(1)
    : '0';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleProjectSort = (field: ProjectSortField) => {
    if (projectSortField === field) {
      setProjectSortOrder(projectSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setProjectSortField(field);
      setProjectSortOrder('desc');
    }
  };

  const handleCapacitySort = (field: CapacitySortField) => {
    if (capacitySortField === field) {
      setCapacitySortOrder(capacitySortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setCapacitySortField(field);
      setCapacitySortOrder('desc');
    }
  };

  const sortedPersonStats = useMemo(() => {
    return [...filteredData.personStats].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalTasks':
          comparison = a.totalTasks - b.totalTasks;
          break;
        case 'tasksCompleted':
          comparison = a.tasksCompleted - b.tasksCompleted;
          break;
        case 'totalHours':
          comparison = a.totalHours - b.totalHours;
          break;
        case 'completionRate':
          const rateA = a.totalTasks > 0 ? (a.tasksCompleted / a.totalTasks) : 0;
          const rateB = b.totalTasks > 0 ? (b.tasksCompleted / b.totalTasks) : 0;
          comparison = rateA - rateB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData.personStats, sortField, sortOrder]);

  const sortedProjectStats = useMemo(() => {
    return [...filteredData.projectStats].sort((a, b) => {
      let comparison = 0;

      switch (projectSortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalTasks':
          comparison = a.totalTasks - b.totalTasks;
          break;
        case 'completedTasks':
          comparison = a.completedTasks - b.completedTasks;
          break;
        case 'completionPercentage':
          comparison = a.completionPercentage - b.completionPercentage;
          break;
      }

      return projectSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData.projectStats, projectSortField, projectSortOrder]);

  const sortedCapacityStats = useMemo(() => {
    return [...filteredData.personStats].sort((a, b) => {
      let comparison = 0;

      switch (capacitySortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalHours':
          comparison = a.totalHours - b.totalHours;
          break;
        case 'capacityUsage':
          comparison = a.capacityUsage - b.capacityUsage;
          break;
      }

      return capacitySortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData.personStats, capacitySortField, capacitySortOrder]);

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center animate-slide-in-from-top">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Operacional</h1>
          <p className="text-muted-foreground">Análise de produtividade e projetos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleDarkMode} title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <InternManager
            people={data.personStats}
            onUpdateInterns={handleUpdateInterns}
          />
          <Button variant="outline" onClick={onReset}>
            Carregar Novo CSV
          </Button>
        </div>
      </div>

      {/* Filtro de Projeto */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <label htmlFor="project-filter" className="text-sm font-medium mb-2 block">
                Filtrar por Projeto
              </label>
              <Select
                id="project-filter"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full max-w-md"
              >
                <option value="all">Todos os Projetos</option>
                {data.projectStats.map((project) => (
                  <option key={project.name} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
            {selectedProject !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProject('all')}
              >
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-slide-in-from-bottom transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Horas trabalhadas no período
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-from-bottom"
          style={{ animationDelay: '0.1s' }}
          onClick={() => setIsAllTasksModalOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas registradas (clique para ver)
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-from-bottom"
          style={{ animationDelay: '0.2s' }}
          onClick={() => setIsCompletedTasksModalOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de conclusão: {completionRate}% (clique para ver)
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-from-bottom"
          style={{ animationDelay: '0.3s' }}
          onClick={() => setIsActivePeopleModalOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.personStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Colaboradores ativos (clique para ver)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="people">Pessoas</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="capacity">Capacidade</TabsTrigger>
            <TabsTrigger value="estimated">Estimado vs Real</TabsTrigger>
          </TabsList>
          <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4" id="tab-content-overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top 5 Performers
                </CardTitle>
                <CardDescription>Pessoas que mais concluíram tarefas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Tarefas Planejadas</TableHead>
                      <TableHead className="text-right">Total de tarefas concluídas</TableHead>
                      <TableHead className="text-right">Horas realizadas</TableHead>
                      <TableHead className="text-right">Taxa de Conclusão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformers.map((person) => {
                      const completionRate = person.totalTasks > 0
                        ? ((person.tasksCompleted / person.totalTasks) * 100).toFixed(1)
                        : '0';
                      return (
                        <TableRow key={person.name}>
                          <TableCell className="font-medium">
                            <button
                              onClick={() => handlePersonClick(person)}
                              className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
                            >
                              {person.name}
                            </button>
                            <InternBadge isIntern={person.isIntern} />
                          </TableCell>
                          <TableCell className="text-right">{person.totalTasks}</TableCell>
                          <TableCell className="text-right">{person.tasksCompleted}</TableCell>
                          <TableCell className="text-right">{person.totalHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium ${
                              parseFloat(completionRate) >= 80
                                ? 'text-green-600'
                                : parseFloat(completionRate) >= 50
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              {completionRate}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  Menos Ativas
                </CardTitle>
                <CardDescription>Pessoas com menos horas trabalhadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Tarefas Planejadas</TableHead>
                      <TableHead className="text-right">Tarefas Executadas</TableHead>
                      <TableHead className="text-right">Horas realizadas</TableHead>
                      <TableHead className="text-right">% Utilização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowPerformers.map((person) => {
                      return (
                        <TableRow key={person.name}>
                          <TableCell className="font-medium">
                            <button
                              onClick={() => handlePersonClick(person)}
                              className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
                            >
                              {person.name}
                            </button>
                            <InternBadge isIntern={person.isIntern} />
                          </TableCell>
                          <TableCell className="text-right">{person.totalTasks}</TableCell>
                          <TableCell className="text-right">{person.tasksCompleted}</TableCell>
                          <TableCell className="text-right">{person.totalHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium ${
                              person.capacityUsage >= 100
                                ? 'text-red-600'
                                : person.capacityUsage >= 80
                                ? 'text-green-600'
                                : 'text-yellow-600'
                            }`}>
                              {person.capacityUsage.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ProjectCompletionChart data={filteredData.projectStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people" className="space-y-4" id="tab-content-people">
          <Card>
            <CardContent className="pt-6">
              <PersonActivityChart data={filteredData.personStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Pessoa</CardTitle>
              <CardDescription>Estatísticas completas de cada colaborador (clique nos cabeçalhos para ordenar)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('totalTasks')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Total de Tarefas <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('tasksCompleted')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Concluídas <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('totalHours')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Horas Totais <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('completionRate')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Taxa Conclusão <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPersonStats.map((person) => {
                    // Obter projetos únicos da pessoa (exceto "Sprint | 2025")
                    const personProjects = person.tasks
                      ? Array.from(new Set(person.tasks.map(t => t.project)))
                          .filter(p => p !== 'Sprint | 2025')
                      : [];

                    return (
                      <TableRow key={person.name}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePersonClick(person)}
                                className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
                              >
                                {person.name}
                              </button>
                              <InternBadge isIntern={person.isIntern} />
                            </div>
                            {personProjects.length > 0 && (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Projetos trabalhados:</span>
                                <div className="flex flex-wrap gap-1">
                                  {personProjects.map(project => (
                                    <span
                                      key={project}
                                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium"
                                    >
                                      {project}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{person.totalTasks}</TableCell>
                        <TableCell className="text-right">{person.tasksCompleted}</TableCell>
                        <TableCell className="text-right">{person.totalHours.toFixed(1)}h</TableCell>
                        <TableCell className="text-right">
                          {person.totalTasks > 0
                            ? ((person.tasksCompleted / person.totalTasks) * 100).toFixed(1)
                            : '0'}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4" id="tab-content-projects">
          <Card>
            <CardContent className="pt-6">
              <ProjectCompletionChart data={filteredData.projectStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Projeto</CardTitle>
              <CardDescription>Status de conclusão de cada projeto (clique nos cabeçalhos para ordenar)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleProjectSort('name')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Projeto <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleProjectSort('totalTasks')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Total de Tarefas <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleProjectSort('completedTasks')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Concluídas <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleProjectSort('completionPercentage')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        % Conclusão <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProjectStats.map((project) => (
                    <TableRow key={project.name}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleProjectClick(project.name)}
                          className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
                        >
                          {project.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">{project.totalTasks}</TableCell>
                      <TableCell className="text-right">{project.completedTasks}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-medium ${
                            project.completionPercentage >= 80
                              ? 'text-green-600'
                              : project.completionPercentage >= 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {project.completionPercentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4" id="tab-content-tasks">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Tarefas</CardTitle>
              <CardDescription>Visualização completa de todas as tarefas com status, tempos e projetos</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Flatten all tasks with person info
                const allTasksWithPerson = filteredData.personStats.flatMap(person =>
                  (person.tasks || []).map(task => ({
                    ...task,
                    personName: person.name,
                    isIntern: person.isIntern,
                    personData: person,
                  }))
                );

                // Calculate pagination
                const totalTasks = allTasksWithPerson.length;
                const totalPages = Math.ceil(totalTasks / tasksPerPage);
                const startIndex = (currentPage - 1) * tasksPerPage;
                const endIndex = startIndex + tasksPerPage;
                const currentTasks = allTasksWithPerson.slice(startIndex, endIndex);

                return (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome da Tarefa</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Tempo Estimado</TableHead>
                          <TableHead className="text-right">Tempo Executado</TableHead>
                          <TableHead className="text-right">Diferença</TableHead>
                          <TableHead>Projeto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTasks.map((task, index) => {
                          const diff = task.actualHours - task.estimatedHours;
                          const animationDelay = `${index * 0.02}s`;

                          return (
                            <TableRow
                              key={`${task.personName}-${index}`}
                              className="animate-fade-in"
                              style={{ animationDelay }}
                            >
                              <TableCell className="font-medium">{task.name}</TableCell>
                              <TableCell>
                                <button
                                  onClick={() => handlePersonClick(task.personData)}
                                  className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer inline-flex items-center gap-2"
                                >
                                  {task.personName}
                                  <InternBadge isIntern={task.isIntern} />
                                </button>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  task.isCompleted
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                }`}>
                                  {task.isCompleted ? 'Concluída' : 'Em andamento'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">{task.estimatedHours.toFixed(1)}h</TableCell>
                              <TableCell className="text-right">{task.actualHours.toFixed(1)}h</TableCell>
                              <TableCell className="text-right">
                                <span className={`font-medium ${
                                  diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-muted-foreground'
                                }`}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}h
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
                                  {task.project}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {totalTasks === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma tarefa encontrada para o filtro aplicado.
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalTasks > 0 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Exibindo {startIndex + 1} a {Math.min(endIndex, totalTasks)} de {totalTasks} tarefas
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                          >
                            Primeira
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Anterior
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="w-10"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Próxima
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                          >
                            Última
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4" id="tab-content-capacity">
          <Card>
            <CardContent className="pt-6">
              <CapacityChart data={filteredData.personStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise de Capacidade</CardTitle>
              <CardDescription>
                Comparação entre capacidade padrão (80h por sprint de 15 dias) e horas reais trabalhadas (clique nos cabeçalhos para ordenar)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleCapacitySort('name')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleCapacitySort('totalHours')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        Horas Trabalhadas <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Capacidade (80h)</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleCapacitySort('capacityUsage')}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                      >
                        % Utilização <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCapacityStats.map((person) => (
                    <TableRow key={person.name}>
                      <TableCell className="font-medium">
                        {person.name}
                        <InternBadge isIntern={person.isIntern} />
                      </TableCell>
                      <TableCell className="text-right">{person.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">{person.isIntern ? '40h' : '80h'}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-medium ${
                            person.capacityUsage >= 100
                              ? 'text-red-600'
                              : person.capacityUsage >= 80
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {person.capacityUsage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimated" className="space-y-4" id="tab-content-estimated">
          <Card>
            <CardContent className="pt-6">
              <EstimatedVsActualChart data={filteredData.personStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparação Estimado vs Real por Pessoa</CardTitle>
              <CardDescription>Análise de desvio entre tempo estimado e tempo real trabalhado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Horas Estimadas</TableHead>
                    <TableHead className="text-right">Horas Reais</TableHead>
                    <TableHead className="text-right">Diferença</TableHead>
                    <TableHead className="text-right">% Desvio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.personStats
                    .filter(person => person.estimatedHours > 0)
                    .map((person) => {
                      const diff = person.totalHours - person.estimatedHours;
                      const deviation = person.estimatedHours > 0
                        ? ((diff / person.estimatedHours) * 100)
                        : 0;
                      return (
                        <TableRow key={person.name}>
                          <TableCell className="font-medium">
                            <button
                              onClick={() => handlePersonClick(person)}
                              className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
                            >
                              {person.name}
                            </button>
                            <InternBadge isIntern={person.isIntern} />
                          </TableCell>
                          <TableCell className="text-right">{person.estimatedHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right">{person.totalHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-right">
                            <span className={diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : ''}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}h
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`font-medium ${
                                Math.abs(deviation) > 20
                                  ? 'text-red-600'
                                  : Math.abs(deviation) > 10
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              {filteredData.personStats.filter(p => p.estimatedHours > 0).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado de tempo estimado disponível. Certifique-se de mapear a coluna "Horas Estimadas" ao importar o CSV.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Tarefas da Pessoa */}
      <PersonTasksModal
        person={selectedPerson}
        isOpen={isPersonModalOpen}
        onClose={handleClosePersonModal}
      />

      {/* Modal de Tarefas do Projeto */}
      <ProjectTasksModal
        project={selectedProjectData}
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
      />

      {/* Modal de Todas as Tarefas */}
      <AllTasksModal
        isOpen={isAllTasksModalOpen}
        onClose={() => setIsAllTasksModalOpen(false)}
        personStats={filteredData.personStats}
        onPersonClick={handlePersonClick}
      />

      {/* Modal de Tarefas Concluídas */}
      <CompletedTasksModal
        isOpen={isCompletedTasksModalOpen}
        onClose={() => setIsCompletedTasksModalOpen(false)}
        personStats={filteredData.personStats}
        onPersonClick={handlePersonClick}
      />

      {/* Modal de Pessoas Ativas */}
      <ActivePeopleModal
        isOpen={isActivePeopleModalOpen}
        onClose={() => setIsActivePeopleModalOpen(false)}
        personStats={filteredData.personStats}
        onPersonClick={handlePersonClick}
      />
    </div>
  );
}
