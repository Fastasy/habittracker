import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

interface WeightChartProps {
  data: { date: string; weight: number | null }[];
}

const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  // Filter out nulls and format dates for the chart
  const chartData = useMemo(() => {
    return data
      .filter(d => d.weight !== null)
      .map(d => ({
        ...d,
        label: format(parseISO(d.date), 'MMM d'),
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Ensure chronological order
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Weight Trend</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Your weight logs over time.</p>
        <div className="flex flex-col items-center justify-center py-10 opacity-50">
          <span className="text-4xl mb-2">⚖️</span>
          <p className="text-sm font-medium text-zinc-500">No weight data for this period.</p>
        </div>
      </div>
    );
  }

  // Calculate min/max for Y axis domain to make variations visible
  const weights = chartData.map(d => d.weight as number);
  const minWeight = Math.floor(Math.min(...weights) - 2);
  const maxWeight = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Weight Trend</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Your weight logs over time.</p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#71717a' }} 
              dy={10} 
            />
            <YAxis 
              domain={[minWeight, maxWeight]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#71717a' }} 
              tickFormatter={(val) => `${val}kg`}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 500,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              formatter={(value: number) => [`${value} kg`, 'Weight']}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6" // blue-500
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeightChart;
