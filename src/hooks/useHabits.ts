import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Habit, HabitStore, StreakInfo } from '../types/habit';
import {
  today,
  toDateString,
  getLast365Days,
  isHabitScheduledForDate,
  parseISO,
  isBefore,
  eachDayOfInterval,
  subDays,
  getDayOfWeek,
  addDays,
} from '../utils/dateUtils';

export const useHabits = () => {
  const [store, setStore] = useState<HabitStore>({ habits: [], logs: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [habitsRes, logsRes] = await Promise.all([
          supabase.from('habits').select('*'),
          supabase.from('habit_logs').select('*')
        ]);

        if (habitsRes.error) throw habitsRes.error;
        if (logsRes.error) throw logsRes.error;

        const habits = habitsRes.data.map(h => ({
          id: h.id,
          name: h.name,
          frequency: h.frequency,
          timesPerWeek: h.times_per_week,
          specificDays: h.specific_days,
          color: h.color,
          isBad: h.is_bad,
          emoji: h.icon,
          createdAt: new Date(h.created_at).toISOString().split('T')[0]
        }));

        const logs = logsRes.data.map(l => ({
          habitId: l.habit_id,
          date: l.date,
          completed: l.completed,
          completedAt: l.completed_at
        }));

        setStore({ habits, logs });
      } catch (err) {
        console.error('Failed to load from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newHabit: Habit = {
      ...habit,
      id,
      createdAt: toDateString(new Date()),
    };
    setStore(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
    
    supabase.from('habits').insert({
      id,
      name: habit.name,
      frequency: habit.frequency,
      times_per_week: habit.timesPerWeek,
      specific_days: habit.specificDays,
      color: habit.color,
      is_bad: habit.isBad ?? false,
      icon: habit.emoji,
      created_at: createdAt
    }).then(res => { if (res.error) console.error(res.error); });

    return newHabit;
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    setStore(prev => ({
      ...prev,
      habits: prev.habits.map(h => (h.id === id ? { ...h, ...updates } : h)),
    }));
    
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.timesPerWeek !== undefined) dbUpdates.times_per_week = updates.timesPerWeek;
    if (updates.specificDays !== undefined) dbUpdates.specific_days = updates.specificDays;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.isBad !== undefined) dbUpdates.is_bad = updates.isBad;
    if (updates.emoji !== undefined) dbUpdates.icon = updates.emoji;

    supabase.from('habits').update(dbUpdates).eq('id', id)
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setStore(prev => ({
      habits: prev.habits.filter(h => h.id !== id),
      logs: prev.logs.filter(l => l.habitId !== id),
    }));
    supabase.from('habits').delete().eq('id', id)
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  const toggleLog = useCallback((habitId: string, date: string) => {
    setStore(prev => {
      const existing = prev.logs.find(l => l.habitId === habitId && l.date === date);
      let isCompleted = true;
      if (existing) {
        isCompleted = !existing.completed;
        const newLogs = prev.logs.map(l =>
          l.habitId === habitId && l.date === date
            ? { ...l, completed: isCompleted, completedAt: isCompleted ? new Date().toISOString() : undefined }
            : l
        );
        
        supabase.from('habit_logs')
          .update({ completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
          .eq('habit_id', habitId).eq('date', date)
          .then(res => { if (res.error) console.error(res.error); });
          
        return { ...prev, logs: newLogs };
      } else {
        const completedAt = new Date().toISOString();
        const newLogs = [...prev.logs, { habitId, date, completed: true, completedAt }];
        
        supabase.from('habit_logs')
          .insert({ habit_id: habitId, date, completed: true, completed_at: completedAt })
          .then(res => { if (res.error) console.error(res.error); });
          
        return { ...prev, logs: newLogs };
      }
    });
  }, []);

  const isCompleted = useCallback(
    (habitId: string, date: string) => {
      return store.logs.some(l => l.habitId === habitId && l.date === date && l.completed);
    },
    [store.logs]
  );

  const getStreak = useCallback(
    (habitId: string): StreakInfo => {
      const habit = store.habits.find(h => h.id === habitId);
      if (!habit) return { current: 0, longest: 0 };

      const todayStr = today();
      const allDays = getLast365Days().filter(d => isHabitScheduledForDate(habit, d));

      // For times_per_week, we need special handling
      if (habit.frequency === 'times_per_week') {
        const timesNeeded = habit.timesPerWeek ?? 1;
        // Build weeks and check if target met
        const weeks: string[][] = [];
        const start = parseISO(allDays[0]);
        const end = parseISO(allDays[allDays.length - 1]);
        let weekStart = start;
        while (!isBefore(end, weekStart)) {
          const weekEnd = addDays(weekStart, 6);
          const weekDays: string[] = [];
          eachDayOfInterval({ start: weekStart, end: weekEnd }).forEach(d => {
            const ds = toDateString(d);
            if (allDays.includes(ds)) weekDays.push(ds);
          });
          if (weekDays.length > 0) weeks.push(weekDays);
          weekStart = addDays(weekStart, 7);
        }

        const weekCompleted = weeks.map(wDays =>
          wDays.filter(d => store.logs.some(l => l.habitId === habitId && l.date === d && l.completed)).length >= timesNeeded
        );

        let current = 0;
        let longest = 0;
        let streak = 0;
        // Go from most recent week backwards
        for (let i = weekCompleted.length - 1; i >= 0; i--) {
          if (weekCompleted[i]) {
            streak++;
            if (i === weekCompleted.length - 1 || i === weekCompleted.length - 2) {
              current = streak; // current or last week
            }
          } else {
            if (current === 0 && i === weekCompleted.length - 2) {
              current = 0;
            }
            longest = Math.max(longest, streak);
            streak = 0;
          }
        }
        longest = Math.max(longest, streak);
        return { current, longest };
      }

      // Daily / specific_days streak
      const completedDays = new Set(
        store.logs.filter(l => l.habitId === habitId && l.completed).map(l => l.date)
      );

      const scheduledDays = allDays.filter(d => d <= todayStr);

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Check if today or yesterday is completed (grace period)
      const todayScheduled = scheduledDays.includes(todayStr);
      const startIdx = scheduledDays.length - 1;

      // Build streak from today backwards
      let activeStreak = 0;
      for (let i = startIdx; i >= 0; i--) {
        const d = scheduledDays[i];
        if (completedDays.has(d)) {
          activeStreak++;
        } else {
          // If today isn't done yet, don't break streak
          if (i === startIdx && todayScheduled && !completedDays.has(todayStr)) {
            continue;
          }
          break;
        }
      }
      currentStreak = activeStreak;

      // Calculate longest streak
      tempStreak = 0;
      for (const d of scheduledDays) {
        if (completedDays.has(d)) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      return { current: currentStreak, longest: longestStreak };
    },
    [store]
  );

  const getCompletionRate = useCallback(
    (habitId: string, days: string[]): number => {
      const habit = store.habits.find(h => h.id === habitId);
      if (!habit) return 0;
      const scheduled = days.filter(d => isHabitScheduledForDate(habit, d));
      if (scheduled.length === 0) return 0;
      const completed = scheduled.filter(d =>
        store.logs.some(l => l.habitId === habitId && l.date === d && l.completed)
      );
      return Math.round((completed.length / scheduled.length) * 100);
    },
    [store]
  );

  const getOverallCompletionRate = useCallback(
    (days: string[]): number => {
      const activeHabits = store.habits;
      if (activeHabits.length === 0) return 0;

      let totalScheduled = 0;
      let totalCompleted = 0;

      for (const habit of activeHabits) {
        const scheduled = days.filter(d => isHabitScheduledForDate(habit, d));
        totalScheduled += scheduled.length;
        totalCompleted += scheduled.filter(d =>
          store.logs.some(l => l.habitId === habit.id && l.date === d && l.completed)
        ).length;
      }

      if (totalScheduled === 0) return 0;
      return Math.round((totalCompleted / totalScheduled) * 100);
    },
    [store]
  );

  const getTotalCheckIns = useCallback(
    (): number => store.logs.filter(l => l.completed).length,
    [store.logs]
  );

  const getDailyCompletionData = useCallback(
    (days: string[]) => {
      return days.map(date => {
        const activeHabits = store.habits.filter(h => isHabitScheduledForDate(h, date));
        const completed = activeHabits.filter(h =>
          store.logs.some(l => l.habitId === h.id && l.date === date && l.completed)
        );
        return {
          date,
          total: activeHabits.length,
          completed: completed.length,
          rate: activeHabits.length > 0 ? Math.round((completed.length / activeHabits.length) * 100) : 0,
        };
      });
    },
    [store]
  );

  const getWeeklyCompletionData = useCallback(
    (numWeeks: number) => {
      const result = [];
      const endDate = new Date();
      for (let i = numWeeks - 1; i >= 0; i--) {
        const weekEnd = subDays(endDate, i * 7);
        const weekStart = subDays(weekEnd, 6);
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(toDateString);
        const rate = getOverallCompletionRate(days);
        result.push({
          label: `W${numWeeks - i}`,
          week: toDateString(weekStart),
          rate,
        });
      }
      return result;
    },
    [getOverallCompletionRate]
  );

  const getWeekdayStats = useCallback(
    (days: string[]) => {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const stats = dayNames.map((name, idx) => {
        const dayDates = days.filter(d => getDayOfWeek(d) === idx);
        let totalScheduled = 0;
        let totalCompleted = 0;
        for (const habit of store.habits) {
          const scheduled = dayDates.filter(d => isHabitScheduledForDate(habit, d));
          totalScheduled += scheduled.length;
          totalCompleted += scheduled.filter(d =>
            store.logs.some(l => l.habitId === habit.id && l.date === d && l.completed)
          ).length;
        }
        return {
          day: name,
          rate: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0,
          total: totalScheduled,
        };
      });
      return stats;
    },
    [store]
  );

  const getHeatmapData = useCallback(
    (days: string[]): Record<string, number> => {
      const result: Record<string, number> = {};
      for (const date of days) {
        const activeHabits = store.habits.filter(h => isHabitScheduledForDate(h, date));
        const completed = activeHabits.filter(h =>
          store.logs.some(l => l.habitId === h.id && l.date === date && l.completed)
        );
        result[date] = activeHabits.length > 0
          ? completed.length / activeHabits.length
          : -1; // -1 = no habits scheduled
      }
      return result;
    },
    [store]
  );

  const getLongestActiveStreak = useCallback((): number => {
    if (store.habits.length === 0) return 0;
    return Math.max(...store.habits.map(h => getStreak(h.id).longest));
  }, [store.habits, getStreak]);

  const getHabitMiniTrend = useCallback(
    (habitId: string, weeks: number = 8) => {
      const result = [];
      const endDate = new Date();
      for (let i = weeks - 1; i >= 0; i--) {
        const weekEnd = subDays(endDate, i * 7);
        const weekStart = subDays(weekEnd, 6);
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(toDateString);
        result.push({ week: i, rate: getCompletionRate(habitId, days) });
      }
      return result;
    },
    [getCompletionRate]
  );

  return {
    habits: store.habits,
    logs: store.logs,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleLog,
    isCompleted,
    getStreak,
    getCompletionRate,
    getOverallCompletionRate,
    getTotalCheckIns,
    getDailyCompletionData,
    getWeeklyCompletionData,
    getWeekdayStats,
    getHeatmapData,
    getLongestActiveStreak,
    getHabitMiniTrend,
  };
};
