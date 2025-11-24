import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PersonStats } from '@/types';

interface EstimatedVsActualChartProps {
  data: PersonStats[];
  title?: string;
}

export function EstimatedVsActualChart({ data, title = "Tempo Estimado vs Realizado" }: EstimatedVsActualChartProps) {
  // Filtrar apenas pessoas que têm horas estimadas
  const filteredData = data.filter(person => person.estimatedHours > 0);

  const chartData = filteredData.map(person => ({
    name: person.name.length > 15 ? person.name.substring(0, 15) + '...' : person.name,
    'Horas Estimadas': Number(person.estimatedHours.toFixed(2)),
    'Horas Reais': Number(person.totalHours.toFixed(2)),
  }));

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum dado de tempo estimado disponível. Mapeie a coluna "Horas Estimadas" para visualizar este gráfico.</p>
      </div>
    );
  }

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#f3f4f6' : '#374151';
  const gridColor = isDark ? '#333333' : '#e5e7eb';

  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={120}
            interval={0}
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Horas', angle: -90, position: 'insideLeft', fill: textColor }}
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
          <Legend
            wrapperStyle={{ color: textColor, paddingTop: '10px' }}
            verticalAlign="top"
          />
          <Bar dataKey="Horas Estimadas" fill="#f59e0b" />
          <Bar dataKey="Horas Reais" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
