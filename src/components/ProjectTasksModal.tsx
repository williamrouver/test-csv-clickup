import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Circle, User } from 'lucide-react';
import { ResizableDialog } from '@/components/ResizableDialog';

interface ProjectTasksModalProps {
  project: { name: string; tasks: any[] } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectTasksModal({ project, isOpen, onClose }: ProjectTasksModalProps) {
  if (!project) return null;

  const tasks = project.tasks || [];
  const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  const totalActual = tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
  const totalDiff = totalActual - totalEstimated;
  const totalDeviation = totalEstimated > 0 ? ((totalDiff / totalEstimated) * 100) : 0;
  const completedTasks = tasks.filter(t => t.isCompleted).length;

  return (
    <ResizableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Tarefas do Projeto: ${project.name}`}
      defaultWidth={1400}
      defaultHeight={700}
    >
      <div className="flex flex-col space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg flex-shrink-0">
            <div>
              <p className="text-sm text-muted-foreground">Total de Tarefas</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
              <p className="text-2xl font-bold text-green-600">
                {completedTasks}
              </p>
              <p className="text-xs text-muted-foreground">
                {tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0}% completo
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Estimado</p>
              <p className="text-2xl font-bold">{totalEstimated.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Real</p>
              <p className="text-2xl font-bold">{totalActual.toFixed(1)}h</p>
              <p className={`text-xs ${totalDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totalDiff > 0 ? '+' : ''}{totalDiff.toFixed(1)}h ({totalDeviation > 0 ? '+' : ''}{totalDeviation.toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Tabela de Tarefas */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 whitespace-nowrap"></TableHead>
                  <TableHead className="min-w-[200px] whitespace-nowrap">Tarefa</TableHead>
                  <TableHead className="whitespace-nowrap">Responsável</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Hrs Est.</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Hrs Reais</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Dif.</TableHead>
                  <TableHead className="text-right whitespace-nowrap">% Desvio</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma tarefa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task, index) => {
                    const estimatedHours = task.estimatedHours || 0;
                    const actualHours = task.hours || 0;
                    const diff = actualHours - estimatedHours;
                    const deviation = estimatedHours > 0
                      ? ((diff / estimatedHours) * 100)
                      : 0;

                    return (
                      <TableRow key={index} className={task.isCompleted ? 'bg-green-50 dark:bg-green-950/20' : ''}>
                        <TableCell>
                          {task.isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="max-w-[300px] truncate" title={task.name || 'Sem nome'}>
                            {task.name || 'Sem nome'}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{task.assignee || 'Não atribuído'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {estimatedHours.toFixed(1)}h
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {actualHours.toFixed(1)}h
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span className={diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-muted-foreground'}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}h
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
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
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                            task.isCompleted
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}>
                            {task.status || 'Sem status'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
      </div>
    </ResizableDialog>
  );
}
