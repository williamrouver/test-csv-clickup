import { useState, useEffect } from 'react';
import { PersonStats } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserCog } from 'lucide-react';

interface InternManagerProps {
  people: PersonStats[];
  onUpdateInterns: (updatedPeople: PersonStats[]) => void;
  trigger?: React.ReactNode;
}

export function InternManager({ people, onUpdateInterns, trigger }: InternManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localPeople, setLocalPeople] = useState<PersonStats[]>(people);

  // Atualizar localPeople quando people mudar
  useEffect(() => {
    setLocalPeople(people);
  }, [people]);

  const handleToggleIntern = (personName: string) => {
    const updated = localPeople.map(person => {
      if (person.name === personName) {
        const isIntern = !person.isIntern;
        // Recalcular capacityUsage baseado no novo status
        const capacity = isIntern ? 40 : 80;
        const capacityUsage = (person.totalHours / capacity) * 100;
        return { ...person, isIntern, capacityUsage };
      }
      return person;
    });
    setLocalPeople(updated);
  };

  const handleSave = () => {
    onUpdateInterns(localPeople);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalPeople(people);
    setIsOpen(false);
  };

  const internCount = localPeople.filter(p => p.isIntern).length;

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <UserCog className="h-4 w-4 mr-2" />
          Gerenciar Estagiários {internCount > 0 && `(${internCount})`}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Estagiários</DialogTitle>
            <DialogDescription>
              Marque as pessoas que são estagiárias. A capacidade será ajustada de 80h para 40h por sprint de 15 dias.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto px-1">
            <div className="space-y-2">
              {localPeople.map((person) => (
                <div
                  key={person.name}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`intern-${person.name}`}
                    checked={person.isIntern || false}
                    onChange={() => handleToggleIntern(person.name)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor={`intern-${person.name}`}
                    className="flex-1 cursor-pointer select-none"
                  >
                    <span className="font-medium">{person.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({person.totalHours.toFixed(1)}h trabalhadas)
                    </span>
                    {person.isIntern && (
                      <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded font-medium">
                        ESTAGIÁRIO
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
