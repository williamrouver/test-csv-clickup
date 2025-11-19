import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ProjectStats } from '@/types';

interface ProjectCompletionChartProps {
  data: ProjectStats[];
}

export function ProjectCompletionChart({ data }: ProjectCompletionChartProps) {
  const chartData = data.map(project => ({
    name: project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name,
    'Conclusão (%)': parseFloat(project.completionPercentage.toFixed(1)),
    'Tarefas Completas': project.completedTasks,
    'Total de Tarefas': project.totalTasks,
  }));

  // Cores baseadas na % de conclusão
  const getColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // verde
    if (percentage >= 50) return '#f59e0b'; // amarelo
    return '#ef4444'; // vermelho
  };

  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold mb-4">% de Conclusão por Projeto</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis label={{ value: '% Conclusão', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Conclusão (%)" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry['Conclusão (%)'])} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
