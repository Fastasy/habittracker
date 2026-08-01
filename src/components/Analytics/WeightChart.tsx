import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Activity } from 'lucide-react';

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
      <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
        <Activity className="w-6 h-6 text-zinc-500 mb-2" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">No telemetry available</p>
      </div>
    );
  }

  // Calculate min/max for Y axis domain to make variations visible
  const weights = chartData.map(d => d.weight as number);
  const minWeight = Math.floor(Math.min(...weights) - 2);
  const maxWeight = Math.ceil(Math.max(...weights) + 2);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:[stroke:rgba(63,63,70,0.4)]" />
        <XAxis 
          dataKey="label" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} 
          dy={10} 
        />
        <YAxis 
          domain={[minWeight, maxWeight]} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} 
          tickFormatter={(val) => `${val}kg`}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: '#09090b', // zinc-950
            border: '1px solid rgba(63,63,70,0.8)', // zinc-800
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ color: '#10b981' }} // emerald-500
          labelStyle={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
          formatter={(value: number) => [`${value} kg`, 'Weight']}
          cursor={{ stroke: 'rgba(16,185,129,0.3)', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#10b981" // emerald-500
          strokeWidth={2}
          fill="url(#weightGradient)"
          dot={{ r: 3, strokeWidth: 2, fill: '#09090b', stroke: '#10b981' }}
          activeDot={{ r: 5, strokeWidth: 2, fill: '#10b981', stroke: '#09090b' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;
