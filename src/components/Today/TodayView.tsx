import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Target, Zap } from 'lucide-react';
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

const QUOTES = [
  "Small steps every day lead to big results.",
  "Consistency is the key to mastery.",
  "You don't rise to the level of your goals, you fall to the level of your systems.",
  "Every expert was once a beginner.",
  "Progress, not perfection.",
  "The secret is to show up every day.",
  "Build the habit, and the habit will build you.",
  "One day at a time.",
];

const TodayView: React.FC<TodayViewProps> = ({ habits, isCompleted, toggleLog, getStreak }) => {
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

  const quote = useMemo(() => QUOTES[new Date().getDay() % QUOTES.length], []);

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
      className="max-w-2xl mx-auto"
    >
      {/* Quote banner */}
      {isTodaySelected && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 rounded-2xl bg-black dark:bg-zinc-900 shadow-xl overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="bg-yellow-400 p-1.5 rounded-lg">
              <Zap className="w-4 h-4 text-black flex-shrink-0" />
            </div>
            <p className="text-sm text-zinc-300 dark:text-zinc-400 font-medium pt-1 tracking-wide">{quote}</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">{dayLabel}</h2>
            {isTodaySelected && (
              <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                Today
              </span>
            )}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goForward}
            disabled={isTodaySelected}
            className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-200"
          >
            <ChevronRight className="w-5 h-5" />
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
          const dayPartial = !dayComplete && dayDone > 0;

          return (
            <motion.button
              key={ds}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedDate(day)}
              className={`snap-start relative flex flex-col items-center gap-1 px-4 py-3 rounded-2xl flex-shrink-0 transition-all duration-300 min-w-[64px] border-2 ${
                isSelected
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xl scale-105 z-10'
                  : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-zinc-400 dark:text-zinc-500' : ''}`}>
                {format(day, 'EEE')}
              </span>
              <span className={`text-xl font-black ${isSelected ? '' : 'text-zinc-900 dark:text-white'}`}>
                {format(day, 'd')}
              </span>
              
              <div className={`mt-1 w-2 h-2 rounded-full transition-colors ${
                dayComplete
                  ? 'bg-green-500'
                  : dayPartial
                  ? 'bg-yellow-400'
                  : isSelected ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-200 dark:bg-zinc-800'
              }`} />
              
              {isT && !isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 border-2 border-white dark:border-zinc-950 rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Progress Card */}
      <AnimatePresence mode="popLayout">
        {totalCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-3xl p-6 mb-8 transition-all duration-500 border-2 ${
            allDone
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-2xl'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
          }`}>
            {allDone ? (
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-3xl animate-bounce shadow-[0_0_30px_rgba(250,204,21,0.5)]">
                  🏆
                </div>
                <div>
                  <p className="font-black text-2xl tracking-tight mb-1">
                    {isTodaySelected ? 'Flawless Victory!' : 'Perfect Day!'}
                  </p>
                  <p className={`font-medium ${allDone ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-500'}`}>
                    {isTodaySelected
                      ? 'You crushed all your habits today.'
                      : `All ${totalCount} habits completed.`}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-400 rounded-lg">
                      <Target className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Progress</p>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">
                        {completedCount} <span className="text-zinc-400">/ {totalCount}</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
                    {Math.round(progressPct)}<span className="text-yellow-500">%</span>
                  </span>
                </div>
                <div className="h-4 bg-zinc-100 dark:bg-black rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    className="h-full rounded-full bg-yellow-400 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg) translateX(-100%)' }} />
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-4 relative">
        {scheduledHabits.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl mt-4"
          >
            {habits.length === 0 ? (
              <>
                <div className="w-24 h-24 rounded-full bg-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.4)] flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-black" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">Blank Canvas</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-sm mx-auto font-medium">
                  Go to <span className="text-black dark:text-white font-bold bg-yellow-400/20 px-2 py-0.5 rounded">My Habits</span> to create your first habit and start your journey!
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6 grayscale opacity-80">😌</div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Rest Day</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
                  No habits scheduled for {format(selectedDate, 'EEEE')}s. Take a breather!
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <HabitCheckItem
                  habit={habit}
                  completed={false}
                  onToggle={() => toggleLog(habit.id, dateStr)}
                />
              </motion.div>
            ))}

            {pendingHabits.length > 0 && completedHabits.length > 0 && (
              <motion.div layout className="flex items-center gap-4 py-4 opacity-60">
                <div className="flex-1 h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Done
                </span>
                <div className="flex-1 h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </motion.div>
            )}

            {completedHabits.map((habit, i) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
      
      <style>{`
        @keyframes shimmer {
          100% { transform: skewX(-20deg) translateX(200%); }
        }
      `}</style>
    </motion.div>
  );
};

export default TodayView;
