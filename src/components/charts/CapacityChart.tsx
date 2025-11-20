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

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum dado de capacidade disponível</p>
      </div>
    );
  }

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#f3f4f6' : '#374151';
  const gridColor = isDark ? '#333333' : '#e5e7eb';

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold mb-4">Capacidade vs Real (% de Utilização)</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Linha de referência: 100% = 80 horas por sprint de 15 dias
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            stroke={textColor}
            tick={{ fill: textColor }}
          />
          <YAxis
            label={{ value: '% Capacidade', angle: -90, position: 'insideLeft', fill: textColor }}
            stroke={textColor}
            tick={{ fill: textColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              border: `1px solid ${isDark ? '#333333' : '#e5e7eb'}`,
              borderRadius: '6px',
              color: textColor
            }}
            labelStyle={{ color: textColor }}
          />
          <Legend wrapperStyle={{ color: textColor }} />
          <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "100%", fill: textColor }} />
          <Bar dataKey="Uso de Capacidade (%)" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
