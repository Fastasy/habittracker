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

interface WeekdayChartProps {
  data: { day: string; rate: number; total: number }[];
}

const CustomTooltip: React.FC<{ active?: boolean; payload?: { value: number; payload: { day: string; total: number } }[]; label?: string }> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{payload[0].payload.day}</p>
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{payload[0].value}%</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{payload[0].payload.total} check-ins</p>
      </div>
    );
  }
  return null;
};

const WeekdayChart: React.FC<WeekdayChartProps> = ({ data }) => {
  const maxRate = Math.max(...data.map(d => d.rate));
  const bestDay = data.find(d => d.rate === maxRate);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Consistency by Day</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Which days you complete habits most</p>
        </div>
        {bestDay && bestDay.rate > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Best day</p>
            <p className="font-bold text-indigo-600 dark:text-indigo-400">{bestDay.day}</p>
          </div>
        )}
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[stroke:#374151]" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.rate === maxRate && entry.rate > 0 ? '#4f46e5' : '#c4b5fd'}
                  fillOpacity={entry.total === 0 ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeekdayChart;
