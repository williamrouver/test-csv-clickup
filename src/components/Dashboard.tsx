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
import { Users, Clock, CheckCircle, TrendingUp, TrendingDown, BarChart3, ArrowUpDown, Filter, Settings, Sun, Moon } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { useEffect } from 'react';
import { InternManager } from '@/components/InternManager';
import { InternBadge } from '@/components/InternBadge';

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
    const filteredPersonStats = data.personStats.filter(person =>
      peopleInProject.has(person.name)
    );

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
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
        <Card>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de conclusão: {completionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.personStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Colaboradores ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="people">Pessoas</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="capacity">Capacidade</TabsTrigger>
          <TabsTrigger value="estimated">Estimado vs Real</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                            {person.name}
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
                            {person.name}
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

        <TabsContent value="people" className="space-y-4">
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
                  {sortedPersonStats.map((person) => (
                    <TableRow key={person.name}>
                      <TableCell className="font-medium">
                        {person.name}
                        <InternBadge isIntern={person.isIntern} />
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
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
                      <TableCell className="font-medium">{project.name}</TableCell>
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

        <TabsContent value="capacity" className="space-y-4">
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

        <TabsContent value="estimated" className="space-y-4">
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
                            {person.name}
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
    </div>
  );
}
