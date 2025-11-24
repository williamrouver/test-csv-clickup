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

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum projeto disponível para exibir</p>
      </div>
    );
  }

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#f3f4f6' : '#374151';
  const gridColor = isDark ? '#333333' : '#e5e7eb';

  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold mb-4">% de Conclusão por Projeto</h3>
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
            label={{ value: '% Conclusão', angle: -90, position: 'insideLeft', fill: textColor }}
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
