import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, LayoutList, CheckCircle2, Coffee,
  AlertCircle, TrendingUp, Flame,
} from 'lucide-react';
import { format, subDays, addDays, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../../types/habit';
import { useHabits } from '../../hooks/useHabits';
import { useSettings } from '../../hooks/useSettings';
import { toDateString, isHabitScheduledForDate, getLastNDays } from '../../utils/dateUtils';
import HabitCheckItem from './HabitCheckItem';
import InfoTooltip from '../InfoTooltip';

interface TodayViewProps {
  habits: Habit[];
  logs: ReturnType<typeof useHabits>['logs'];
  isCompleted: ReturnType<typeof useHabits>['isCompleted'];
  toggleLog: ReturnType<typeof useHabits>['toggleLog'];
  logAmount: ReturnType<typeof useHabits>['logAmount'];
  getStreak: ReturnType<typeof useHabits>['getStreak'];
  getOverallCompletionRate: ReturnType<typeof useHabits>['getOverallCompletionRate'];
  getTotalCheckIns: ReturnType<typeof useHabits>['getTotalCheckIns'];
  getLongestActiveStreak: ReturnType<typeof useHabits>['getLongestActiveStreak'];
}

const card = 'bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm';

/** Today — the day's habits and the run you're on. */
const TodayView: React.FC<TodayViewProps> = ({
  habits, logs, isCompleted, toggleLog, logAmount, getStreak,
  getOverallCompletionRate, getTotalCheckIns, getLongestActiveStreak,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { disciplineConfig } = useSettings();

  const dateStr = toDateString(selectedDate);
  const isTodaySelected = isToday(selectedDate);

  const goBack = () => setSelectedDate(prev => subDays(prev, 1));
  const goForward = () => { if (!isTodaySelected) setSelectedDate(prev => addDays(prev, 1)); };

  const recentDays = useMemo(() => Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i)), []);

  const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, dateStr));
  const completedHabits = scheduledHabits.filter(h => isCompleted(h.id, dateStr));
  const pendingHabits = scheduledHabits.filter(h => !isCompleted(h.id, dateStr));
  const completedCount = completedHabits.length;
  const totalCount = scheduledHabits.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const dayLabel = isTodaySelected ? 'Today' : format(selectedDate, 'EEEE');
  const dateLabel = format(selectedDate, 'MMMM d, yyyy');

  const disciplineInfo = useMemo(() => {
    const last14 = getLastNDays(14);
    const rate = getOverallCompletionRate(last14);
    return { rate, isFailing: rate < disciplineConfig.threshold };
  }, [getOverallCompletionRate, disciplineConfig]);

  const totalCheckIns = useMemo(() => getTotalCheckIns(), [getTotalCheckIns]);
  const longestStreak = useMemo(() => getLongestActiveStreak(), [getLongestActiveStreak]);

  const ringPct = totalCount > 0 ? completedCount / totalCount : 0;
  const R = 52, STROKE = 8, C = 2 * Math.PI * R;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto pt-2 md:pt-4 pb-2 md:pb-20 space-y-5 md:space-y-6">

      {/* ---- Header ---- */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">{dayLabel}</h2>
            {isTodaySelected && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest rounded-md">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 tracking-wide">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goBack} aria-label="Previous day" className="w-11 h-11 flex items-center justify-center rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goForward} disabled={isTodaySelected} aria-label="Next day" className="w-11 h-11 flex items-center justify-center rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ---- Date pills ---- */}
      <div className="flex gap-2 overflow-x-auto pb-2 pr-1 scrollbar-hide snap-x">
        {recentDays.map((day, i) => {
          const ds = toDateString(day);
          const isSelected = ds === dateStr;
          const isT = isToday(day);
          const dayHabits = habits.filter(h => isHabitScheduledForDate(h, ds));
          const dayDone = dayHabits.filter(h => isCompleted(h.id, ds)).length;
          const dayComplete = dayHabits.length > 0 && dayDone === dayHabits.length;
          return (
            <motion.button key={ds} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }}
              onClick={() => setSelectedDate(day)}
              className={`snap-start relative flex flex-col items-center gap-1.5 px-3.5 py-2.5 rounded-xl flex-shrink-0 transition-all duration-200 min-w-[56px] border ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md'
                  : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{format(day, 'EEE')}</span>
              <span className={`text-lg font-semibold ${isSelected ? '' : 'text-zinc-900 dark:text-zinc-300'}`}>{format(day, 'd')}</span>
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                dayComplete ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : isSelected ? 'bg-zinc-500 dark:bg-zinc-400' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
              {isT && !isSelected && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />}
            </motion.button>
          );
        })}
      </div>

      {/* `grid-cols-1` (= minmax(0,1fr)) matters: with no base column the mobile
          track is `auto`, which sizes to max-content and forces the page wider
          than the viewport. */}
      <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] items-start">
        {/* ================= LEFT ================= */}
        <div className="space-y-5 md:space-y-6">
          {/* ---- HERO ---- */}
          <div className={`${card} relative overflow-hidden p-4 md:p-6`}>
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{ background: `radial-gradient(90% 120% at 100% 0%, ${allDone ? '#34d399' : '#a78bfa'}, transparent 65%)` }} />
            <div className="relative flex items-center gap-4 md:gap-6">
              <div className="relative flex-shrink-0 w-[92px] h-[92px] md:w-32 md:h-32">
                <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
                  <circle cx={64} cy={64} r={R} fill="none" stroke="rgba(113,113,122,0.25)" strokeWidth={STROKE} />
                  <circle cx={64} cy={64} r={R} fill="none" stroke={allDone ? '#34d399' : '#a78bfa'} strokeWidth={STROKE}
                    strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - ringPct)}
                    style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.4,0,0.2,1)' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tabular-nums leading-none">{completedCount}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">of {totalCount}</span>
                </div>
              </div>

              <div className="flex-1 min-w-[150px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  {isTodaySelected ? "Today" : format(selectedDate, 'EEEE')}
                </p>
                <h3 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {totalCount === 0 ? 'Nothing scheduled'
                    : allDone ? 'All done'
                    : `${totalCount - completedCount} habit${totalCount - completedCount === 1 ? '' : 's'} remaining`}
                </h3>
                <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {completedCount}/{totalCount} done
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Discipline alert ---- */}
          <AnimatePresence mode="popLayout">
            {disciplineInfo.isFailing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                  <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Discipline Threshold Breached</h4>
                      <InfoTooltip text="Triggered when your 14-day completion rate falls below your discipline threshold (default 80%)." />
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

          {/* ---- Habit list ---- */}
          <div className="space-y-3 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Habits</h3>
              {totalCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {completedCount}/{totalCount} done
                </span>
              )}
            </div>

            {scheduledHabits.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-10 px-5 md:py-14 md:px-6 border border-dashed border-zinc-300 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                {habits.length === 0 ? (
                  <>
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-5 text-zinc-400">
                      <LayoutList className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">No habits yet</h3>
                    <p className="text-xs text-zinc-500 tracking-wide max-w-sm mx-auto">Head to Habits to build your first routine.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-5 text-zinc-400">
                      <Coffee className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">Rest Day</h3>
                    <p className="text-xs text-zinc-500 tracking-wide max-w-sm mx-auto">No habits scheduled for {format(selectedDate, 'EEEE')}. Recovery counts too.</p>
                  </>
                )}
              </motion.div>
            ) : (
              <AnimatePresence>
                {pendingHabits.map((habit, i) => (
                  <motion.div key={habit.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
                    <HabitCheckItem
                      habit={habit}
                      completed={false}
                      onToggle={() => toggleLog(habit.id, dateStr)}
                      currentAmount={logs.find(l => l.habitId === habit.id && l.date === dateStr)?.amount}
                      onLogAmount={(amount) => logAmount(habit.id, dateStr, amount)}
                      streak={getStreak(habit.id).current}
                    />
                  </motion.div>
                ))}

                {pendingHabits.length > 0 && completedHabits.length > 0 && (
                  <motion.div layout className="flex items-center gap-4 py-3 opacity-50">
                    <div className="flex-1 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Done
                    </span>
                    <div className="flex-1 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                  </motion.div>
                )}

                {completedHabits.map((habit) => (
                  <motion.div key={habit.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <HabitCheckItem
                      habit={habit}
                      completed={true}
                      onToggle={() => toggleLog(habit.id, dateStr)}
                      currentAmount={logs.find(l => l.habitId === habit.id && l.date === dateStr)?.amount}
                      onLogAmount={(amount) => logAmount(habit.id, dateStr, amount)}
                      streak={getStreak(habit.id).current}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-5 md:space-y-6">
          {/* Numbers */}
          <div className={`${card} p-4 md:p-5`}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">The Run</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg py-3 px-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">14-day</span>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">{disciplineInfo.rate.toFixed(0)}%</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg py-3 px-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">Check-ins</span>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">{totalCheckIns}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg py-3 px-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">Best run</span>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">{longestStreak}d</p>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed">
              Consistency over intensity. The 14-day rate is your rolling completion across every scheduled habit.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodayView;
