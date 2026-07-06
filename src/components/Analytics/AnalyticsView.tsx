import React, { useState, useMemo } from 'react';
import { DateRangeFilter } from '../../types/habit';
import { useHabits } from '../../hooks/useHabits';
import { getLastNDays } from '../../utils/dateUtils';
import OverviewCards from './OverviewCards';
import HeatmapCalendar from './HeatmapCalendar';
import CompletionChart from './CompletionChart';
import WeekdayChart from './WeekdayChart';
import HabitBreakdown from './HabitBreakdown';


interface AnalyticsViewProps {
  habits: ReturnType<typeof useHabits>['habits'];
  getStreak: ReturnType<typeof useHabits>['getStreak'];
  getCompletionRate: ReturnType<typeof useHabits>['getCompletionRate'];
  getOverallCompletionRate: ReturnType<typeof useHabits>['getOverallCompletionRate'];
  getTotalCheckIns: ReturnType<typeof useHabits>['getTotalCheckIns'];
  getWeeklyCompletionData: ReturnType<typeof useHabits>['getWeeklyCompletionData'];
  getWeekdayStats: ReturnType<typeof useHabits>['getWeekdayStats'];
  getHeatmapData: ReturnType<typeof useHabits>['getHeatmapData'];
  getLongestActiveStreak: ReturnType<typeof useHabits>['getLongestActiveStreak'];
  getHabitMiniTrend: ReturnType<typeof useHabits>['getHabitMiniTrend'];
}

const FILTER_OPTIONS: { label: string; value: DateRangeFilter }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'All time', value: 'all' },
];

const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  habits,
  getStreak,
  getCompletionRate,
  getOverallCompletionRate,
  getTotalCheckIns,
  getWeeklyCompletionData,
  getWeekdayStats,
  getHeatmapData,
  getLongestActiveStreak,
  getHabitMiniTrend,
}) => {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('30d');

  const filterDays = useMemo(() => {
    if (dateFilter === '7d') return getLastNDays(7);
    if (dateFilter === '30d') return getLastNDays(30);
    return getLastNDays(180);
  }, [dateFilter]);

  const weeklyRate = getOverallCompletionRate(getLastNDays(7));
  const monthlyRate = getOverallCompletionRate(getLastNDays(30));
  const longestStreak = getLongestActiveStreak();
  const totalCheckIns = getTotalCheckIns();

  const weeklyData = useMemo(() => {
    const numWeeks = dateFilter === '7d' ? 4 : dateFilter === '30d' ? 8 : 24;
    return getWeeklyCompletionData(numWeeks).map(d => ({ label: d.label, rate: d.rate }));
  }, [dateFilter, getWeeklyCompletionData]);

  const weekdayData = useMemo(() => getWeekdayStats(filterDays), [filterDays, getWeekdayStats]);
  const heatmapData = useMemo(() => getHeatmapData(getLastNDays(180)), [getHeatmapData]);

  if (habits.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track your progress over time</p>
          </div>
        </div>
        <div className="text-center py-24 bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-900">
          <div className="text-6xl mb-6">📊</div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">No data yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Create some habits and start checking them off to see your analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Your habit performance overview</p>
        </div>
        {/* Date range filter */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDateFilter(opt.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                dateFilter === opt.value
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview cards */}
      <OverviewCards
        totalHabits={habits.length}
        weeklyRate={weeklyRate}
        monthlyRate={monthlyRate}
        longestStreak={longestStreak}
        totalCheckIns={totalCheckIns}
      />

      {/* Heatmap */}
      <HeatmapCalendar heatmapData={heatmapData} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompletionChart
          data={weeklyData}
          title="Completion Trend"
          subtitle={`Weekly completion rate over the selected period`}
        />
        <WeekdayChart data={weekdayData} />
      </div>

      {/* Per-habit breakdown */}
      <HabitBreakdown
        habits={habits}
        getStreak={getStreak}
        getCompletionRate={getCompletionRate}
        getHabitMiniTrend={getHabitMiniTrend}
        days={filterDays}
      />
    </div>
  );
};

export default AnalyticsView;
