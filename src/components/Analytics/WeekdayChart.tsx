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
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl px-4 py-3 min-w-[120px]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{payload[0].payload.day}</p>
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">{payload[0].value}%</p>
        <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-1">{payload[0].payload.total} events</p>
      </div>
    );
  }
  return null;
};

const WeekdayChart: React.FC<WeekdayChartProps> = ({ data }) => {
  const maxRate = Math.max(...data.map(d => d.rate));
  const bestDay = data.find(d => d.rate === maxRate);

  return (
    <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-xl p-6 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Day Distribution</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Adherence by day of week</p>
        </div>
        {bestDay && bestDay.rate > 0 && (
          <div className="text-right flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Peak Day</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">{bestDay.day}</p>
          </div>
        )}
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[stroke:rgba(63,63,70,0.4)]" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.rate === maxRate && entry.rate > 0 ? '#10b981' : 'rgba(16,185,129,0.3)'}
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
