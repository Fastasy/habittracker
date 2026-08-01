import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CompletionChartProps {
  data: { label: string; rate: number }[];
  title: string;
  subtitle?: string;
}

const CustomTooltip: React.FC<{ active?: boolean; payload?: { value: number }[]; label?: string }> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl px-4 py-3 min-w-[120px]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">{payload[0].value}% completion</p>
      </div>
    );
  }
  return null;
};

const CompletionChart: React.FC<CompletionChartProps> = ({ data, title, subtitle }) => {
  return (
    <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-xl p-6 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
      <div className="mb-6 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">{title}</h3>
        {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{subtitle}</p>}
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:[stroke:rgba(63,63,70,0.4)]" />
            <XAxis
              dataKey="label"
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
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(16,185,129,0.3)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#completionGradient)"
              dot={{ fill: '#09090b', stroke: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#10b981', stroke: '#09090b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CompletionChart;
