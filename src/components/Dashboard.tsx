import { useMemo } from 'react';
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
import { getTopPerformers, getLowPerformers } from '@/lib/csv-parser';
import { Users, Clock, CheckCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface DashboardProps {
  data: DashboardData;
  onReset: () => void;
}

export function Dashboard({ data, onReset }: DashboardProps) {
  const topPerformers = useMemo(() => getTopPerformers(data.personStats, 5), [data.personStats]);
  const lowPerformers = useMemo(() => getLowPerformers(data.personStats, 5), [data.personStats]);

  const completionRate = data.totalTasks > 0
    ? ((data.completedTasks / data.totalTasks) * 100).toFixed(1)
    : '0';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Operacional</h1>
          <p className="text-muted-foreground">Análise de produtividade e projetos</p>
        </div>
        <Button variant="outline" onClick={onReset}>
          Carregar Novo CSV
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalHours.toFixed(1)}h</div>
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
            <div className="text-2xl font-bold">{data.totalTasks}</div>
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
            <div className="text-2xl font-bold">{data.completedTasks}</div>
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
            <div className="text-2xl font-bold">{data.personStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Colaboradores ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="people">Pessoas</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="capacity">Capacidade</TabsTrigger>
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
                      <TableHead className="text-right">Tarefas</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformers.map((person) => (
                      <TableRow key={person.name}>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell className="text-right">{person.tasksCompleted}</TableCell>
                        <TableCell className="text-right">{person.totalHours.toFixed(1)}h</TableCell>
                      </TableRow>
                    ))}
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
                <CardDescription>Pessoas com menos tarefas concluídas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Tarefas</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowPerformers.map((person) => (
                      <TableRow key={person.name}>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell className="text-right">{person.tasksCompleted}</TableCell>
                        <TableCell className="text-right">{person.totalHours.toFixed(1)}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ProjectCompletionChart data={data.projectStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <PersonActivityChart data={data.personStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Pessoa</CardTitle>
              <CardDescription>Estatísticas completas de cada colaborador</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Total de Tarefas</TableHead>
                    <TableHead className="text-right">Concluídas</TableHead>
                    <TableHead className="text-right">Horas Totais</TableHead>
                    <TableHead className="text-right">Taxa Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.personStats.map((person) => (
                    <TableRow key={person.name}>
                      <TableCell className="font-medium">{person.name}</TableCell>
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
              <ProjectCompletionChart data={data.projectStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Projeto</CardTitle>
              <CardDescription>Status de conclusão de cada projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead className="text-right">Total de Tarefas</TableHead>
                    <TableHead className="text-right">Concluídas</TableHead>
                    <TableHead className="text-right">% Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.projectStats.map((project) => (
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
              <CapacityChart data={data.personStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise de Capacidade</CardTitle>
              <CardDescription>
                Comparação entre capacidade padrão (80h por sprint de 15 dias) e horas reais trabalhadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Horas Trabalhadas</TableHead>
                    <TableHead className="text-right">Capacidade (80h)</TableHead>
                    <TableHead className="text-right">% Utilização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.personStats.map((person) => (
                    <TableRow key={person.name}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell className="text-right">{person.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">80h</TableCell>
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
      </Tabs>
    </div>
  );
}
