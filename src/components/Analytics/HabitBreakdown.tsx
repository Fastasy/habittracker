import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { Habit, StreakInfo } from '../../types/habit';
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
      <div className="bg-gray-800 text-white text-xs rounded px-2 py-1">
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
        <p className="text-gray-400 dark:text-gray-500">No habits to show yet</p>
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Per-Habit Breakdown</h3>
      <div className="space-y-4">
        {habitsWithStats.map(({ habit, streak, rate, trend }) => (
          <div
            key={habit.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {/* Emoji + Name */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: habit.color + '20', border: `1.5px solid ${habit.color}30` }}
            >
              {habit.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{habit.name}</p>
              {/* Progress bar */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${rate}%`, backgroundColor: habit.color }}
                  />
                </div>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: habit.color }}>
                  {rate}%
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{streak.current}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{streak.longest}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">best</p>
              </div>
            </div>

            {/* Mini trend chart */}
            <div className="hidden md:block w-20 h-10 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <Tooltip content={<MiniTrendTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={habit.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, fill: habit.color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Mobile streak */}
            <div className="sm:hidden flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{streak.current}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitBreakdown;
