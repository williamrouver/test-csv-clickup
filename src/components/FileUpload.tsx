import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Aceitar arquivos .csv independente do MIME type (alguns SOs não setam corretamente)
        if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
          onFileSelect(file);
        } else {
          alert('Por favor, selecione um arquivo CSV válido.');
        }
      }
      // Resetar o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = '';
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        // Aceitar arquivos .csv independente do MIME type
        if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
          onFileSelect(file);
        } else {
          alert('Por favor, selecione um arquivo CSV válido.');
        }
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Dashboard ClickUp</CardTitle>
        <CardDescription>
          Importe seu arquivo CSV exportado do ClickUp para visualizar estatísticas e gráficos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">
            Arraste e solte seu arquivo CSV aqui
          </p>
          <p className="text-sm text-muted-foreground mb-4">ou</p>
          <div>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="default"
              className="cursor-pointer"
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Selecionar arquivo
            </Button>
          </div>
        </div>
        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium mb-2">Instruções:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Exporte seus dados do ClickUp em formato CSV</li>
            <li>Certifique-se de que o arquivo contém colunas relevantes (responsável, horas, status, projeto/tags)</li>
            <li>Após o upload, você poderá mapear as colunas do seu CSV</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
