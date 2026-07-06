import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface DailyBarChartProps {
  data: { date: string; rate: number; completed: number; total: number }[];
  title: string;
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: { value: number; payload: { date: string; completed: number; total: number } }[];
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { date, completed, total } = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {format(parseISO(date), 'EEE, MMM d')}
        </p>
        <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{payload[0].value}%</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{completed}/{total} habits</p>
      </div>
    );
  }
  return null;
};

const DailyBarChart: React.FC<DailyBarChartProps> = ({ data, title }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Daily completion rate</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={d => format(parseISO(d), 'M/d')}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 4 }} />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={20}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.rate >= 80 ? '#7c3aed' : entry.rate >= 50 ? '#a78bfa' : entry.rate > 0 ? '#ddd6fe' : '#e5e7eb'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyBarChart;
