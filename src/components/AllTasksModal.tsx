import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Circle } from 'lucide-react';
import { PersonStats } from '@/types';
import { ResizableDialog } from '@/components/ResizableDialog';

interface AllTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  personStats: PersonStats[];
  onPersonClick: (person: PersonStats) => void;
}

export function AllTasksModal({ isOpen, onClose, personStats, onPersonClick }: AllTasksModalProps) {
  const allTasks = personStats.flatMap(person =>
    (person.tasks || []).map(task => ({
      ...task,
      assignee: person.name,
      isIntern: person.isIntern
    }))
  );

  const totalEstimated = allTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const totalActual = allTasks.reduce((sum, task) => sum + task.actualHours, 0);
  const totalDiff = totalActual - totalEstimated;
  const totalDeviation = totalEstimated > 0 ? ((totalDiff / totalEstimated) * 100) : 0;
  const completedTasks = allTasks.filter(t => t.isCompleted).length;

  return (
    <ResizableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Todas as Tarefas"
      defaultWidth={1500}
      defaultHeight={750}
    >
      <div className="flex flex-col space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg flex-shrink-0">
            <div>
              <p className="text-sm text-muted-foreground">Total de Tarefas</p>
              <p className="text-2xl font-bold">{allTasks.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">
                {allTasks.length > 0 ? ((completedTasks / allTasks.length) * 100).toFixed(1) : 0}% completo
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
                  <TableHead className="whitespace-nowrap">Projeto</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Hrs Est.</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Hrs Reais</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Dif.</TableHead>
                  <TableHead className="text-right whitespace-nowrap">% Desvio</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma tarefa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  allTasks.map((task, index) => {
                    const diff = task.actualHours - task.estimatedHours;
                    const deviation = task.estimatedHours > 0
                      ? ((diff / task.estimatedHours) * 100)
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
                          <div className="max-w-[300px] truncate" title={task.name}>
                            {task.name}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <button
                            onClick={() => {
                              const person = personStats.find(p => p.name === task.assignee);
                              if (person) {
                                onClose();
                                onPersonClick(person);
                              }
                            }}
                            className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          >
                            {task.assignee}
                          </button>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium whitespace-nowrap">
                            {task.project}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {task.estimatedHours.toFixed(1)}h
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {task.actualHours.toFixed(1)}h
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
