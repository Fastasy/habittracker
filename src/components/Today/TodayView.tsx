import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, LayoutList, CheckCircle2, Target, Coffee, Zap, AlertCircle, Copy, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, subDays, addDays, isToday, subWeeks } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../../types/habit';
import { useHabits } from '../../hooks/useHabits';
import { useSettings } from '../../hooks/useSettings';
import { useMomentum } from '../../hooks/useMomentum';
import { toDateString, isHabitScheduledForDate, getLastNDays } from '../../utils/dateUtils';
import HabitCheckItem from './HabitCheckItem';
import { emojiToIcon } from '../../utils/iconMap';
import MomentumChart from './MomentumChart';

import InfoTooltip from '../InfoTooltip';

interface TodayViewProps {
  habits: Habit[];
  isCompleted: ReturnType<typeof useHabits>['isCompleted'];
  toggleLog: ReturnType<typeof useHabits>['toggleLog'];
  getStreak: ReturnType<typeof useHabits>['getStreak'];
}

const TodayView: React.FC<TodayViewProps> = ({ habits, isCompleted, toggleLog }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { pillars, valueConfig, disciplineConfig, exportConfig } = useSettings();
  const momentumData = useMomentum();

  const dateStr = toDateString(selectedDate);
  const isTodaySelected = isToday(selectedDate);

  const goBack = () => setSelectedDate(prev => subDays(prev, 1));
  const goForward = () => {
    if (!isTodaySelected) setSelectedDate(prev => addDays(prev, 1));
  };

  // Past 7 days for quick nav
  const recentDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  }, []);

  const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, dateStr));
  const completedHabits = scheduledHabits.filter(h => isCompleted(h.id, dateStr));
  const pendingHabits = scheduledHabits.filter(h => !isCompleted(h.id, dateStr));
  const completedCount = completedHabits.length;
  const totalCount = scheduledHabits.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const dayLabel = isTodaySelected ? 'Today' : format(selectedDate, 'EEEE');
  const dateLabel = format(selectedDate, 'MMMM d, yyyy');

  // Value Tracking Calculation
  const totalValueAccumulated = useMemo(() => {
    return completedHabits.reduce((sum, h) => sum + (h.value || 0), 0);
  }, [completedHabits]);

  // Pillar Stats Calculation
  const pillarStats = useMemo(() => {
    return pillars.map(p => {
      const pHabits = scheduledHabits.filter(h => h.pillarId === p.id);
      const pCompleted = completedHabits.filter(h => h.pillarId === p.id);
      return {
        ...p,
        total: pHabits.length,
        completed: pCompleted.length,
        progress: pHabits.length > 0 ? (pCompleted.length / pHabits.length) * 100 : 0,
      };
    }).filter(p => p.total > 0);
  }, [pillars, scheduledHabits, completedHabits]);

  // Discipline Threshold Calculation (14 day window)
  const disciplineInfo = useMemo(() => {
    const last14Days = getLastNDays(14);
    let total14Scheduled = 0;
    let total14Completed = 0;
    for (const day of last14Days) {
      const sch = habits.filter(h => isHabitScheduledForDate(h, day));
      total14Scheduled += sch.length;
      total14Completed += sch.filter(h => isCompleted(h.id, day)).length;
    }
    const rate = total14Scheduled > 0 ? (total14Completed / total14Scheduled) * 100 : 100;
    const isFailing = rate < disciplineConfig.threshold;
    return { rate, isFailing };
  }, [habits, isCompleted, disciplineConfig]);

  // Markdown Exporter
  const handleExport = () => {
    let tpl = exportConfig.template;
    tpl = tpl.replace(/\{\{date\}\}/g, dateLabel);
    tpl = tpl.replace(/\{\{discipline_status\}\}/g, `${disciplineInfo.rate.toFixed(1)}%`);
    tpl = tpl.replace(/\{\{completed_habits\}\}/g, completedCount.toString());
    tpl = tpl.replace(/\{\{missed_habits\}\}/g, pendingHabits.length.toString());
    tpl = tpl.replace(/\{\{value_accumulated\}\}/g, `${totalValueAccumulated} ${valueConfig.symbol}`);
    
    let pStatsStr = '';
    for (const p of pillarStats) {
      pStatsStr += `\n- ${p.icon} ${p.name}: ${p.completed}/${p.total} (${p.progress.toFixed(0)}%)`;
    }
    tpl = tpl.replace(/\{\{pillar_stats\}\}/g, pStatsStr.trim() || 'No pillars active');

    navigator.clipboard.writeText(tpl).then(() => {
      alert("Daily log copied to clipboard!");
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto pt-4 pb-20"
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">{dayLabel}</h2>
            {isTodaySelected && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest rounded-md">
                Today
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 tracking-wide">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="mr-2 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex items-center gap-2 text-xs font-semibold tracking-wide">
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={goBack}
            className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goForward}
            disabled={isTodaySelected}
            className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {recentDays.map((day, i) => {
          const ds = toDateString(day);
          const isSelected = ds === dateStr;
          const isT = isToday(day);
          const dayHabits = habits.filter(h => isHabitScheduledForDate(h, ds));
          const dayDone = dayHabits.filter(h => isCompleted(h.id, ds)).length;
          const dayComplete = dayHabits.length > 0 && dayDone === dayHabits.length;

          return (
            <motion.button
              key={ds}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              onClick={() => setSelectedDate(day)}
              className={`snap-start relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-full flex-shrink-0 transition-all duration-200 min-w-[56px] border ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md'
                  : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                {format(day, 'EEE')}
              </span>
              <span className={`text-lg font-semibold ${isSelected ? '' : 'text-zinc-900 dark:text-zinc-300'}`}>
                {format(day, 'd')}
              </span>
              
              {/* Indicator dot */}
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                dayComplete
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : isSelected ? 'bg-zinc-500 dark:bg-zinc-400' : 'bg-zinc-300 dark:bg-zinc-700'
              }`} />
              
              {isT && !isSelected && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Discipline Net Worth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-lg relative"
      >
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 text-emerald-500" />
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Discipline Net Worth</h3>
            <InfoTooltip text="Your total active momentum score. Compounds at 5% daily on active streaks, but suffers a full reset if you miss a day." />
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{momentumData.currentScore}</span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">pts</span>
          </div>
          
          <div className="flex items-start gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
            {momentumData.droppedRecently ? (
              <>
                <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-500/20 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-500" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  <span className="text-rose-600 dark:text-rose-400">⚠️ Warning:</span> System experiencing drag. The cost of starting over is 10x harder than staying consistent.
                </p>
              </>
            ) : momentumData.currentScore > momentumData.baseSum ? (
              <>
                <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400">🚀 Multiplier Active:</span> Your effort is currently compounding exponentially at +5% daily growth.
                </p>
              </>
            ) : (
              <>
                <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 mt-0.5">
                  <Target className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  Building foundation. Maintain your streak to activate the exponential growth multiplier.
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Momentum Chart */}
      <div className="mb-8">
        <MomentumChart data={momentumData.history} />
      </div>

      {/* Discipline Alert */}
      <AnimatePresence mode="popLayout">
        {disciplineInfo.isFailing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex gap-4 items-start shadow-sm">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Discipline Threshold Breached</h4>
                  <InfoTooltip text="Triggered when your 14-day completion rate falls below your configured discipline threshold." />
                </div>
                <p className="text-xs text-red-600 dark:text-red-300/80 mt-1">{disciplineConfig.message}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1 flex-1 bg-red-200 dark:bg-red-900/40 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${disciplineInfo.rate}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-red-700 dark:text-red-400">{disciplineInfo.rate.toFixed(0)}% / {disciplineConfig.threshold}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Value Tracker Widget */}
      {valueConfig.active && (
        <motion.div className="mb-8 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Value Today</p>
                <InfoTooltip text="The total accrued value of all habits completed today." />
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{totalValueAccumulated} <span className="text-sm text-zinc-400 font-medium">{valueConfig.symbol}</span></p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weekly Target</p>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">~{Math.round((totalValueAccumulated/valueConfig.target)*100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (totalValueAccumulated/valueConfig.target)*100)}%` }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Pillar Progress */}
      {pillarStats.length > 0 && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {pillarStats.map(p => (
            <div key={p.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-3 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: p.color + '15', color: p.color }}>
                {emojiToIcon(p.icon, "w-4 h-4")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate">{p.name}</p>
                  <span className="text-[9px] text-zinc-500">{p.completed}/{p.total}</span>
                </div>
                <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Card */}
      <AnimatePresence mode="popLayout">
        {totalCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-6 mb-8 transition-all duration-300 border ${
            allDone
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80'
          }`}>
            <div className="flex items-end justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${allDone ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  {allDone ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Completion</p>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {completedCount} <span className="text-zinc-400">/ {totalCount} habits</span>
                  </span>
                </div>
              </div>
              <span className={`text-2xl font-semibold tracking-tight ${allDone ? 'text-emerald-500' : 'text-zinc-900 dark:text-white'}`}>
                {Math.round(progressPct)}<span className="text-sm font-normal text-zinc-500">%</span>
              </span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${allDone ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-900 dark:bg-zinc-100'}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-3 relative">
        {scheduledHabits.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-6 border border-dashed border-zinc-300 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20"
          >
            {habits.length === 0 ? (
              <>
                <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-5 text-zinc-400">
                  <LayoutList className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">Today's Agenda: 0 Habits</h3>
                <p className="text-xs text-zinc-500 tracking-wide max-w-sm mx-auto">
                  Your dashboard is empty. Navigate to My Habits to configure your schedule.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-5 text-zinc-400">
                  <Coffee className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">System Rest</h3>
                <p className="text-xs text-zinc-500 tracking-wide max-w-sm mx-auto">
                  No routines scheduled for {format(selectedDate, 'EEEE')}.
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {pendingHabits.map((habit, i) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <HabitCheckItem
                  habit={habit}
                  completed={false}
                  onToggle={() => toggleLog(habit.id, dateStr)}
                />
              </motion.div>
            ))}

            {pendingHabits.length > 0 && completedHabits.length > 0 && (
              <motion.div layout className="flex items-center gap-4 py-4 opacity-50">
                <div className="flex-1 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  Completed
                </span>
                <div className="flex-1 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
              </motion.div>
            )}

            {completedHabits.map((habit, i) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HabitCheckItem
                  habit={habit}
                  completed={true}
                  onToggle={() => toggleLog(habit.id, dateStr)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default TodayView;
