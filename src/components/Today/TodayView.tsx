import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Target, Zap } from 'lucide-react';
import { format, subDays, addDays, isToday } from 'date-fns';
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
    <div className="max-w-2xl mx-auto">
      {/* Quote banner - only on today */}
      {isTodaySelected && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-100 dark:border-violet-900/30">
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-violet-700 dark:text-violet-300 italic font-medium">{quote}</p>
          </div>
        </div>
      )}

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dayLabel}</h2>
            {isTodaySelected && (
              <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-xs font-semibold rounded-full">
                Today
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={goBack}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goForward}
            disabled={isTodaySelected}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick day pills */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {recentDays.map(day => {
          const ds = toDateString(day);
          const isSelected = ds === dateStr;
          const isT = isToday(day);
          const dayHabits = habits.filter(h => isHabitScheduledForDate(h, ds));
          const dayDone = dayHabits.filter(h => isCompleted(h.id, ds)).length;
          const dayComplete = dayHabits.length > 0 && dayDone === dayHabits.length;
          const dayPartial = !dayComplete && dayDone > 0;

          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl flex-shrink-0 transition-all duration-200 min-w-[52px] ${
                isSelected
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm'
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? 'text-violet-200' : 'text-gray-400 dark:text-gray-500'}`}>
                {format(day, 'EEE')}
              </span>
              <span className={`text-base font-bold ${isSelected ? 'text-white' : ''}`}>{format(day, 'd')}</span>
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                dayComplete
                  ? isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                  : dayPartial
                  ? isSelected ? 'bg-amber-300' : 'bg-amber-400'
                  : isSelected ? 'bg-violet-400' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
              {isT && !isSelected && (
                <span className="text-xs text-violet-500 font-bold leading-none">·</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress card */}
      {totalCount > 0 && (
        <div className={`rounded-2xl p-5 mb-6 transition-all duration-500 ${
          allDone
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800/30'
            : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'
        }`}>
          {allDone ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl animate-bounce">
                🎉
              </div>
              <div>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                  {isTodaySelected ? 'Perfect day!' : 'All done!'}
                </p>
                <p className="text-sm text-emerald-600/70 dark:text-emerald-500/70">
                  {isTodaySelected
                    ? 'You completed every habit today. You\'re unstoppable!'
                    : `All ${totalCount} habits completed on this day.`}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {completedCount}/{totalCount} habits done
                  </span>
                </div>
                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                  {Math.round(progressPct)}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-violet-500 to-indigo-600"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {pendingHabits.length > 0 && isTodaySelected && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {pendingHabits.length} left · Keep going!
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Habits list */}
      {scheduledHabits.length === 0 ? (
        <div className="text-center py-16">
          {habits.length === 0 ? (
            <>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-10 h-10 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No habits yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Go to <strong className="text-violet-600 dark:text-violet-400">My Habits</strong> to create your first habit and start building your streak!
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">😌</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Rest day</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No habits scheduled for {format(selectedDate, 'EEEE')}s.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Pending habits */}
          {pendingHabits.map(habit => (
            <HabitCheckItem
              key={habit.id}
              habit={habit}
              completed={false}
              onToggle={() => toggleLog(habit.id, dateStr)}
            />
          ))}

          {/* Divider if both pending and completed exist */}
          {pendingHabits.length > 0 && completedHabits.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              <span className="text-xs font-medium text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Completed
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>
          )}

          {/* Completed habits */}
          {completedHabits.map(habit => (
            <HabitCheckItem
              key={habit.id}
              habit={habit}
              completed={true}
              onToggle={() => toggleLog(habit.id, dateStr)}
            />
          ))}

          {/* Streak pills */}
          {completedCount > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Active Streaks
              </p>
              <div className="flex flex-wrap gap-2">
                {scheduledHabits
                  .filter(h => isCompleted(h.id, dateStr))
                  .map(habit => {
                    const streak = getStreak(habit.id);
                    if (streak.current === 0) return null;
                    return (
                      <div
                        key={habit.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: habit.color + '15',
                          color: habit.color,
                          border: `1px solid ${habit.color}25`,
                        }}
                      >
                        <span>{habit.emoji}</span>
                        <span className="font-medium">{habit.name}</span>
                        <span className="opacity-60">·</span>
                        <span>🔥 {streak.current}d</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TodayView;
