import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PersonStats } from '@/types';

interface PersonActivityChartProps {
  data: PersonStats[];
  title?: string;
}

export function PersonActivityChart({ data, title = "Atividades por Pessoa" }: PersonActivityChartProps) {
  console.log('PersonActivityChart - data recebido:', data);

  const chartData = data.map(person => ({
    name: person.name.length > 15 ? person.name.substring(0, 15) + '...' : person.name,
    'Horas Totais': Number(person.totalHours.toFixed(2)),
    'Tarefas Completas': person.tasksCompleted,
  }));

  console.log('PersonActivityChart - chartData processado:', chartData);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum dado disponível para exibir</p>
      </div>
    );
  }

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#f3f4f6' : '#374151';
  const gridColor = isDark ? '#333333' : '#e5e7eb';

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
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
          <Bar dataKey="Horas Totais" fill="#3b82f6" />
          <Bar dataKey="Tarefas Completas" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
