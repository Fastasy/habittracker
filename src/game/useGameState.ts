import { useMemo } from 'react';
import { Goal, Habit, HabitLog, StreakInfo } from '../types/habit';
import { Todo } from '../types/calendar';
import { GameStats } from './types';
import {
  XP_GOAL, XP_TODO, XP_WEIGH_IN,
  computeHabitXp, countPerfectDays, levelFromXp, rankFor,
} from './xp';
import { evaluateAchievements } from './achievements';
import { isHabitScheduledForDate, today } from '../utils/dateUtils';

interface UseGameStateArgs {
  habits: Habit[];
  logs: HabitLog[];
  goals: Goal[];
  todos: Todo[];
  notes: Record<string, string>;
  weightLogs: { date: string; weight: number }[];
  /** Single source of truth for streak semantics — the same one the UI shows. */
  getStreak: (habitId: string) => StreakInfo;
}

/**
 * Derives the entire game layer (XP, level, rank, combo, achievements) from the
 * data the app already holds. Pure computation — nothing is stored, so it can
 * never drift out of sync with your real history.
 */
export function useGameState({
  habits, logs, goals, todos, notes, weightLogs, getStreak,
}: UseGameStateArgs): GameStats {
  return useMemo(() => {
    const { habitXp, todayXp, totalCompletions } = computeHabitXp(habits, logs);

    const todosDone = todos.filter(t => t.done).length;
    const todosOpen = todos.filter(t => !t.done).length;

    const totalXp =
      habitXp +
      todosDone * XP_TODO +
      goals.length * XP_GOAL +
      weightLogs.length * XP_WEIGH_IN;

    const { level, xpIntoLevel, xpForNext } = levelFromXp(totalXp);

    let bestCombo = 0;
    let longestStreak = 0;
    for (const h of habits) {
      const s = getStreak(h.id);
      bestCombo = Math.max(bestCombo, s.current);
      longestStreak = Math.max(longestStreak, s.longest);
    }

    const todayIso = today();
    const scheduledToday = habits.filter(h => isHabitScheduledForDate(h, todayIso));
    const doneToday = scheduledToday.filter(h =>
      logs.some(l => l.habitId === h.id && l.date === todayIso && l.completed)
    );

    const notesWritten = Object.values(notes).filter(Boolean).length;

    const base = {
      totalXp,
      level,
      xpIntoLevel,
      xpForNext,
      rank: rankFor(level),
      todayXp,
      bestCombo,
      longestStreak,
      totalCompletions,
      perfectDays: countPerfectDays(habits, logs),
      todayTotal: scheduledToday.length,
      todayDone: doneToday.length,
      todosDone,
      todosOpen,
      notesWritten,
      weightLogs: weightLogs.length,
      goalsCount: goals.length,
      habitsCount: habits.length,
    };

    return { ...base, achievements: evaluateAchievements(base) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, logs, goals, todos, notes, weightLogs, getStreak]);
}
