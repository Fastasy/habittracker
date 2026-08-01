import React, { useState, useMemo } from 'react';
import { DateRangeFilter } from '../../types/habit';
import { useHabits } from '../../hooks/useHabits';
import { getLastNDays } from '../../utils/dateUtils';
import OverviewCards from './OverviewCards';
import HeatmapCalendar from './HeatmapCalendar';
import CompletionChart from './CompletionChart';
import WeekdayChart from './WeekdayChart';
import HabitBreakdown from './HabitBreakdown';
import { BarChart3 } from 'lucide-react';

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
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: 'ALL', value: 'all' },
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
  const heatmapData = useMemo(() => getHeatmapData(getLastNDays(365)), [getHeatmapData]);

  if (habits.length === 0) {
    return (
      <div className="max-w-5xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">Metrics</h2>
            <p className="text-sm text-zinc-500 tracking-wide mt-1">Aggregated behavioral analysis.</p>
          </div>
        </div>
        <div className="text-center py-24 bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-950 rounded-lg flex items-center justify-center mx-auto mb-4 text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 tracking-wide">Insufficient Data</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Establish routines and register activity to generate analytics reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">Metrics</h2>
          <p className="text-sm text-zinc-500 tracking-wide mt-1">Aggregated behavioral analysis.</p>
        </div>
        {/* Date range filter */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDateFilter(opt.value)}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                dateFilter === opt.value
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-transparent'
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
          subtitle={`Weekly completion rate over selected period`}
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
