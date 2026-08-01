import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { getLast365Days, getWeeksForHeatmap, toDateString } from '../../utils/dateUtils';
import { Activity } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';

interface HeatmapCalendarProps {
  heatmapData: Record<string, number>;
  habitColor?: string;
}

const getTooltipText = (date: string, value: number): string => {
  const formatted = format(parseISO(date), 'MMM d, yyyy');
  if (value < 0) return `${formatted}: No activities scheduled`;
  if (value === 0) return `${formatted}: 0% completion`;
  return `${formatted}: ${Math.round(value * 100)}% completion`;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ heatmapData }) => {
  const today = toDateString(new Date());
  const days = useMemo(() => getLast365Days(), []);
  const weeks = useMemo(() => getWeeksForHeatmap(days), [days]);

  // Month labels: find first week of each month
  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = [];
    weeks.forEach((week, col) => {
      week.forEach(day => {
        if (!day || day > today) return;
        const d = parseISO(day);
        if (d.getDate() <= 7) {
          // First week of month - check if already added
          const label = MONTH_LABELS[d.getMonth()];
          if (!positions.find(p => p.label === label && Math.abs(p.col - col) < 3)) {
            positions.push({ label, col });
          }
        }
      });
    });
    return positions;
  }, [weeks, today]);

  // Using emerald-500 (#10b981) base color for the heatmap
  const getCellColor = (value: number) => {
    if (value <= 0) return 'rgba(39, 39, 42, 0.5)'; // zinc-800/50
    return `rgba(16, 185, 129, ${0.1 + value * 0.9})`; // emerald-500 with varying opacity
  };

  return (
    <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-xl p-6 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <Activity className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">12-Month Activity Matrix</h3>
        <InfoTooltip text="Visual representation of your daily habit completion rate over the last 12 months." />
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex ml-8 mb-2">
            {weeks.map((_, col) => {
              const pos = monthPositions.find(p => p.col === col);
              return (
                <div key={col} className="w-[14px] mr-[3px] text-center">
                  {pos && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
                      {pos.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-[14px] flex items-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 w-6 text-right leading-none">{label}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  if (!day || day > today) {
                    return <div key={di} className="w-[14px] h-[14px] rounded-[2px] bg-white dark:bg-zinc-800/20 opacity-0" />;
                  }
                  const value = heatmapData[day] ?? -1;
                  const isTodayCell = day === today;
                  
                  return (
                    <div
                      key={di}
                      title={getTooltipText(day, value)}
                      className={`w-[14px] h-[14px] rounded-[3px] cursor-default transition-all hover:scale-125 hover:z-10 relative ${
                        isTodayCell ? 'ring-1 ring-emerald-400 ring-offset-[1px] ring-offset-zinc-50 dark:ring-offset-zinc-950' : ''
                      }`}
                      style={{
                        backgroundColor: getCellColor(value),
                        border: value <= 0 ? '1px solid rgba(63, 63, 70, 0.2)' : 'none' // zinc-700/20
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-6 justify-end">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Less</span>
        <div className="flex gap-[3px]">
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <div
              key={i}
              className="w-[14px] h-[14px] rounded-[3px]"
              style={{
                backgroundColor: getCellColor(v),
                border: v === 0 ? '1px solid rgba(63, 63, 70, 0.2)' : 'none'
              }}
            />
          ))}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">More</span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
