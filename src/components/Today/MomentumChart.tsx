import React from 'react';
import { DailyMomentum } from '../../hooks/useMomentum';
import InfoTooltip from '../InfoTooltip';

interface MomentumChartProps {
  data: DailyMomentum[];
}

const MomentumChart: React.FC<MomentumChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  // Chart dimensions
  const width = 600;
  const height = 150;
  const padding = { top: 20, right: 10, bottom: 20, left: 10 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxScore = Math.max(...data.map(d => d.score), 10);
  const minScore = 0; // Always pin bottom to 0 for dramatic drops

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerWidth;
    const y = height - padding.bottom - ((d.score - minScore) / (maxScore - minScore)) * innerHeight;
    return { x, y, score: d.score, date: d.date };
  });

  return (
    <div className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Momentum Growth Curve</h3>
          <InfoTooltip text="Visualizes your compound growth over the last 30 days. Watch out for red drops when a streak breaks!" />
        </div>
        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Last 30 Days</span>
      </div>
      <div className="relative w-full aspect-[4/1] min-h-[120px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
          preserveAspectRatio="none"
        >
          {/* Background Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = padding.top + ratio * innerHeight;
            return (
              <line 
                key={ratio}
                x1={padding.left} 
                y1={y} 
                x2={width - padding.right} 
                y2={y} 
                className="stroke-zinc-100 dark:stroke-zinc-800/50 stroke-[1]"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Line Segments */}
          {points.map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            // If score drops, it's a cliff
            const isCliff = p.score < prev.score;
            
            return (
              <line
                key={i}
                x1={prev.x}
                y1={prev.y}
                x2={p.x}
                y2={p.y}
                className={`stroke-[2.5] transition-all duration-300 ${
                  isCliff 
                    ? 'stroke-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                    : 'stroke-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                }`}
                strokeLinecap="round"
              />
            );
          })}
          
          {/* Data Points (Dots) */}
          {points.map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            const isCliff = p.score < prev.score;
            return (
              <circle
                key={`dot-${i}`}
                cx={p.x}
                cy={p.y}
                r={2}
                className={`${isCliff ? 'fill-rose-500' : 'fill-emerald-500'}`}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default MomentumChart;
