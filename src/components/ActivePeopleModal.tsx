import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { PersonStats } from '@/types';
import { InternBadge } from '@/components/InternBadge';
import { ResizableDialog } from '@/components/ResizableDialog';

interface ActivePeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  personStats: PersonStats[];
  onPersonClick: (person: PersonStats) => void;
}

export function ActivePeopleModal({ isOpen, onClose, personStats, onPersonClick }: ActivePeopleModalProps) {
  const totalTasks = personStats.reduce((sum, p) => sum + p.totalTasks, 0);
  const totalCompleted = personStats.reduce((sum, p) => sum + p.tasksCompleted, 0);
  const totalHours = personStats.reduce((sum, p) => sum + p.totalHours, 0);
  const totalEstimated = personStats.reduce((sum, p) => sum + p.estimatedHours, 0);

  return (
    <ResizableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <Users className="h-6 w-6 text-blue-600" />
          Colaboradores Ativos
        </>
      }
      defaultWidth={1300}
      defaultHeight={700}
    >
      <div className="flex flex-col space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg flex-shrink-0">
            <div>
              <p className="text-sm text-muted-foreground">Total de Pessoas</p>
              <p className="text-2xl font-bold">{personStats.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Tarefas</p>
              <p className="text-2xl font-bold">{totalTasks}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
              <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground">
                {totalTasks > 0 ? ((totalCompleted / totalTasks) * 100).toFixed(1) : 0}% completo
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horas Totais</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">
                Est: {totalEstimated.toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Tabela de Pessoas */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Nome</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Total Tarefas</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Concluídas</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Horas Totais</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Taxa Conclusão</TableHead>
                  <TableHead className="text-right whitespace-nowrap">% Capacidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum colaborador encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  personStats.map((person) => {
                    const completionRate = person.totalTasks > 0
                      ? ((person.tasksCompleted / person.totalTasks) * 100)
                      : 0;

                    return (
                      <TableRow key={person.name}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onClose();
                                onPersonClick(person);
                              }}
                              className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            >
                              {person.name}
                            </button>
                            <InternBadge isIntern={person.isIntern} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {person.totalTasks}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span className="text-green-600 font-medium">
                            {person.tasksCompleted}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {person.totalHours.toFixed(1)}h
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span className={`font-medium ${
                            completionRate >= 80
                              ? 'text-green-600'
                              : completionRate >= 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            {completionRate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
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
                  })
                )}
              </TableBody>
            </Table>
          </div>
      </div>
    </ResizableDialog>
  );
}
