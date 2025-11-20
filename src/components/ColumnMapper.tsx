import { useState } from 'react';
import { ColumnMapping, CSVData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

interface ColumnMapperProps {
  csvData: CSVData;
  onMappingComplete: (mapping: ColumnMapping) => void;
  onBack: () => void;
}

export function ColumnMapper({ csvData, onMappingComplete, onBack }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({
    assignee: undefined,
    hours: undefined,
    estimatedHours: undefined,
    status: undefined,
    project: undefined,
    tags: undefined,
    date: undefined,
    taskName: undefined,
  });

  const handleSubmit = () => {
    if (!mapping.assignee || !mapping.hours || !mapping.status) {
      alert('Por favor, selecione pelo menos Responsável, Horas e Status');
      return;
    }
    onMappingComplete(mapping);
  };

  const updateMapping = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value || undefined }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Mapear Colunas do CSV</CardTitle>
        <CardDescription>
          Selecione quais colunas do seu CSV correspondem a cada campo. Os campos marcados com * são obrigatórios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Encontramos <strong>{csvData.headers.length}</strong> colunas e <strong>{csvData.rows.length}</strong> linhas no seu CSV.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="assignee">Responsável / Pessoa *</Label>
            <Select
              id="assignee"
              value={mapping.assignee || ''}
              onChange={(e) => updateMapping('assignee', e.target.value)}
            >
              <option value="">Selecione...</option>
              {csvData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Horas Trabalhadas *</Label>
            <Select
              id="hours"
              value={mapping.hours || ''}
              onChange={(e) => updateMapping('hours', e.target.value)}
            >
              <option value="">Selecione...</option>
              {csvData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Horas Estimadas (opcional)</Label>
            <Select
              id="estimatedHours"
              value={mapping.estimatedHours || ''}
              onChange={(e) => updateMapping('estimatedHours', e.target.value)}
            >
              <option value="">Selecione...</option>
              {csvData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Usado para comparar tempo estimado vs realizado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              id="status"
              value={mapping.status || ''}
              onChange={(e) => updateMapping('status', e.target.value)}
            >
              <option value="">Selecione...</option>
              {csvData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Projeto (opcional)</Label>
            <Select
              id="project"
              value={mapping.project || ''}
              onChange={(e) => updateMapping('project', e.target.value)}
            >
              <option value="">Selecione...</option>
              {csvData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (opcional)</Label>
            <Select
              id="tags"
              value={mapping.tags || ''}
              onChange={(e) => updateMapping('tags', e.target.value)}
            >
              <option value="">Selecione...</option>
              {csvData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Se não tiver campo de Projeto, a primeira tag será usada como projeto
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data (opcional)</Label>
            <Select
              id="date"
              value={mapping.date || ''}
              onChange={(e) => updateMapping('date', e.target.value)}
            >
              <option value="">Selecione...</option>
              {csvData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskName">Nome da Tarefa (opcional)</Label>
            <Select
              id="taskName"
              value={mapping.taskName || ''}
              onChange={(e) => updateMapping('taskName', e.target.value)}
            >
              <option value="">Selecione...</option>
              {csvData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Gerar Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
