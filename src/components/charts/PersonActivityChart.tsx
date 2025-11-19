import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PersonStats } from '@/types';

interface PersonActivityChartProps {
  data: PersonStats[];
  title?: string;
}

export function PersonActivityChart({ data, title = "Atividades por Pessoa" }: PersonActivityChartProps) {
  const chartData = data.map(person => ({
    name: person.name.length > 15 ? person.name.substring(0, 15) + '...' : person.name,
    'Horas Totais': person.totalHours,
    'Tarefas Completas': person.tasksCompleted,
  }));

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Horas Totais" fill="#3b82f6" />
          <Bar dataKey="Tarefas Completas" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
