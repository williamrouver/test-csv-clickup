import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PersonStats } from '@/types';

interface CapacityChartProps {
  data: PersonStats[];
}

export function CapacityChart({ data }: CapacityChartProps) {
  const chartData = data.map(person => ({
    name: person.name.length > 15 ? person.name.substring(0, 15) + '...' : person.name,
    'Uso de Capacidade (%)': parseFloat(person.capacityUsage.toFixed(1)),
    'Horas Trabalhadas': person.totalHours,
  }));

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold mb-4">Capacidade vs Real (% de Utilização)</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Linha de referência: 100% = 80 horas por sprint de 15 dias
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis label={{ value: '% Capacidade', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label="100%" />
          <Bar dataKey="Uso de Capacidade (%)" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
