import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ColumnMapper } from '@/components/ColumnMapper';
import { Dashboard } from '@/components/Dashboard';
import { parseCSV, calculateDashboardData } from '@/lib/csv-parser';
import { CSVData, ColumnMapping, DashboardData } from '@/types';

type AppStep = 'upload' | 'mapping' | 'dashboard';

function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      const data = await parseCSV(file);
      setCsvData(data);
      setStep('mapping');
    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      alert('Erro ao processar o arquivo CSV. Verifique se o formato está correto.');
    }
  };

  const handleMappingComplete = (mapping: ColumnMapping) => {
    if (!csvData) return;

    try {
      const data = calculateDashboardData(csvData, mapping);
      setDashboardData(data);
      setStep('dashboard');
    } catch (error) {
      console.error('Erro ao calcular dados do dashboard:', error);
      alert('Erro ao processar os dados. Verifique o mapeamento das colunas.');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setCsvData(null);
    setDashboardData(null);
  };

  const handleBack = () => {
    setStep('upload');
    setCsvData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      {step === 'upload' && <FileUpload onFileSelect={handleFileSelect} />}

      {step === 'mapping' && csvData && (
        <ColumnMapper
          csvData={csvData}
          onMappingComplete={handleMappingComplete}
          onBack={handleBack}
        />
      )}

      {step === 'dashboard' && dashboardData && (
        <Dashboard data={dashboardData} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
