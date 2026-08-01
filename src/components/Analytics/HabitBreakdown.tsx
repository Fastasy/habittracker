import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { Habit, StreakInfo } from '../../types/habit';
import { emojiToIcon } from '../../utils/iconMap';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface HabitBreakdownProps {
  habits: Habit[];
  getStreak: (id: string) => StreakInfo;
  getCompletionRate: (id: string, days: string[]) => number;
  getHabitMiniTrend: (id: string, weeks?: number) => { week: number; rate: number }[];
  days: string[];
}

const MiniTrendTooltip: React.FC<{ active?: boolean; payload?: { value: number }[] }> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-[9px] font-bold uppercase tracking-widest rounded px-2 py-1 shadow-md">
        {payload[0].value}%
      </div>
    );
  }
  return null;
};

const HabitBreakdown: React.FC<HabitBreakdownProps> = ({
  habits,
  getStreak,
  getCompletionRate,
  getHabitMiniTrend,
  days,
}) => {
  if (habits.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800/80 p-8 text-center shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">No telemetry available</p>
      </div>
    );
  }

  const habitsWithStats = habits.map(habit => ({
    habit,
    streak: getStreak(habit.id),
    rate: getCompletionRate(habit.id, days),
    trend: getHabitMiniTrend(habit.id, 8),
  })).sort((a, b) => b.rate - a.rate);

  return (
    <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800/80 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide mb-6">Component Analysis</h3>
      <div className="space-y-3">
        {habitsWithStats.map(({ habit, streak, rate, trend }) => {
          // Normalize color to new system or use a fallback
          const accentColor = habit.color?.startsWith('#') ? habit.color : '#10b981';

          return (
            <div
              key={habit.id}
              className="flex items-center gap-4 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
              >
                {emojiToIcon(habit.emoji, "w-5 h-5")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate tracking-wide">{habit.name}</p>
                {/* Progress bar */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${rate}%`, backgroundColor: accentColor }}
                    />
                  </div>
                  <span className="text-[10px] font-bold w-8 text-right flex-shrink-0" style={{ color: accentColor }}>
                    {rate}%
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6 flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 pl-6">
                <div className="text-center w-12">
                  <div className="flex items-center justify-center mb-0.5">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{streak.current}</span>
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 flex justify-center items-center gap-1">
                    <Flame className="w-2.5 h-2.5" /> Cur
                  </p>
                </div>
                <div className="text-center w-12">
                  <div className="flex items-center justify-center mb-0.5">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{streak.longest}</span>
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 flex justify-center items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" /> Peak
                  </p>
                </div>
              </div>

              {/* Mini trend chart */}
              <div className="hidden md:block w-24 h-8 flex-shrink-0 ml-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <Tooltip content={<MiniTrendTooltip />} cursor={false} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke={accentColor}
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 2.5, fill: accentColor, stroke: '#09090b', strokeWidth: 1.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Mobile streak */}
              <div className="sm:hidden flex items-center gap-1.5 ml-2">
                <Flame className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{streak.current}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitBreakdown;
