import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import { PersonStats } from '@/types';
import { ResizableDialog } from '@/components/ResizableDialog';
import { Select } from '@/components/ui/select';
import { useState } from 'react';

interface OpenTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  personStats: PersonStats[];
  onPersonClick: (person: PersonStats) => void;
  selectedProject?: string;
}

export function OpenTasksModal({ isOpen, onClose, personStats, onPersonClick, selectedProject }: OpenTasksModalProps) {
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>(selectedProject || 'all');

  // Coletar todas as tarefas em aberto
  let allOpenTasks = personStats.flatMap(person =>
    (person.tasks || [])
      .filter(task => !task.isCompleted)
      .map(task => ({
        ...task,
        assignee: person.name,
        isIntern: person.isIntern
      }))
  );

  // Aplicar filtros
  if (filterPerson !== 'all') {
    allOpenTasks = allOpenTasks.filter(task => task.assignee === filterPerson);
  }

  if (filterProject !== 'all') {
    allOpenTasks = allOpenTasks.filter(task => task.project === filterProject);
  }

  // Coletar lista de projetos únicos
  const uniqueProjects = Array.from(new Set(
    personStats.flatMap(person =>
      (person.tasks || []).map(task => task.project)
    )
  )).sort();

  // Coletar lista de pessoas únicas que têm tarefas em aberto
  const peopleWithOpenTasks = Array.from(new Set(
    personStats
      .filter(person => (person.tasks || []).some(task => !task.isCompleted))
      .map(person => person.name)
  )).sort();

  const totalEstimated = allOpenTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const totalActual = allOpenTasks.reduce((sum, task) => sum + task.actualHours, 0);

  return (
    <ResizableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <AlertCircle className="h-6 w-6 text-orange-600" />
          Tarefas em Aberto
        </>
      }
      defaultWidth={1500}
      defaultHeight={750}
    >
      <div className="flex flex-col space-y-4">
        {/* Filtros */}
        <div className="flex gap-4 p-4 bg-muted/50 rounded-lg flex-shrink-0">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground block mb-2">Filtrar por Pessoa</label>
            <Select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)}>
              <option value="all">Todas as pessoas</option>
              {peopleWithOpenTasks.map(person => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm text-muted-foreground block mb-2">Filtrar por Projeto</label>
            <Select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
              <option value="all">Todos os projetos</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg flex-shrink-0">
          <div>
            <p className="text-sm text-muted-foreground">Total em Aberto</p>
            <p className="text-2xl font-bold text-orange-600">{allOpenTasks.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Estimado</p>
            <p className="text-2xl font-bold">{totalEstimated.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Trabalhado</p>
            <p className="text-2xl font-bold">{totalActual.toFixed(1)}h</p>
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
                <TableHead className="text-right whitespace-nowrap">Hrs Trabalhadas</TableHead>
                <TableHead className="text-right whitespace-nowrap">Hrs Restantes</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allOpenTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma tarefa em aberto encontrada
                  </TableCell>
                </TableRow>
              ) : (
                allOpenTasks.map((task, index) => {
                  const remaining = task.estimatedHours - task.actualHours;

                  return (
                    <TableRow key={index} className="bg-orange-50 dark:bg-orange-950/20">
                      <TableCell>
                        <AlertCircle className="h-5 w-5 text-orange-600" />
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
                        <span className={remaining > 0 ? 'text-orange-600 font-medium' : 'text-red-600 font-medium'}>
                          {remaining > 0 ? remaining.toFixed(1) : '0.0'}h
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
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
