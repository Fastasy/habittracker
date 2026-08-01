import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, LayoutList, CheckCircle2, Target, Coffee } from 'lucide-react';
import { format, subDays, addDays, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../../types/habit';
import { useHabits } from '../../hooks/useHabits';
import { toDateString, isHabitScheduledForDate } from '../../utils/dateUtils';
import HabitCheckItem from './HabitCheckItem';

interface TodayViewProps {
  habits: Habit[];
  isCompleted: ReturnType<typeof useHabits>['isCompleted'];
  toggleLog: ReturnType<typeof useHabits>['toggleLog'];
  getStreak: ReturnType<typeof useHabits>['getStreak'];
}

const TodayView: React.FC<TodayViewProps> = ({ habits, isCompleted, toggleLog }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto pt-4"
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
      <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide snap-x">
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
