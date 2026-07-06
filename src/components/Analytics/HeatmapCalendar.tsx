import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { getLast180Days, getWeeksForHeatmap, toDateString } from '../../utils/dateUtils';

interface HeatmapCalendarProps {
  heatmapData: Record<string, number>;
  habitColor?: string;
}

const getTooltipText = (date: string, value: number): string => {
  const formatted = format(parseISO(date), 'MMM d, yyyy');
  if (value < 0) return `${formatted}: No habits scheduled`;
  if (value === 0) return `${formatted}: 0% completed`;
  return `${formatted}: ${Math.round(value * 100)}% completed`;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ heatmapData }) => {
  const today = toDateString(new Date());
  const days = useMemo(() => getLast180Days(), []);
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

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-900 p-6">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Activity Heatmap</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Last 6 months — daily completion intensity</p>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {weeks.map((_, col) => {
              const pos = monthPositions.find(p => p.col === col);
              return (
                <div key={col} className="w-4 mr-1 text-center">
                  {pos && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                      {pos.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-4 flex items-center">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 w-6 text-right leading-none">{label}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  if (!day || day > today) {
                    return <div key={di} className="w-4 h-4 rounded-sm bg-white dark:bg-zinc-800/30 opacity-0" />;
                  }
                  const value = heatmapData[day] ?? -1;
                  const isTodayCell = day === today;
                  return (
                    <div
                      key={di}
                      title={getTooltipText(day, value)}
                      className={`w-4 h-4 rounded-sm cursor-default transition-all hover:scale-125 hover:z-10 relative ${
                        isTodayCell ? 'ring-2 ring-yellow-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900' : ''
                      }`}
                      style={
                        value > 0
                          ? { backgroundColor: `rgba(124, 58, 237, ${0.15 + value * 0.85})` }
                          : { backgroundColor: 'var(--heatmap-empty, #e5e7eb)' }
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-sm"
            style={v === 0
              ? { backgroundColor: 'rgb(229 231 235)' }
              : { backgroundColor: `rgba(124, 58, 237, ${0.15 + v * 0.85})` }
            }
          />
        ))}
        <span className="text-xs text-zinc-400 dark:text-zinc-500">More</span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
