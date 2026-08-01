import { useMemo, useEffect } from 'react';
import { Habit } from '../types/habit';
import { useHabits } from './useHabits';
import { getLastNDays, today } from '../utils/dateUtils';

const STORAGE_KEY_SCORE = 'streakly_momentum_score';
const STORAGE_KEY_HISTORY = 'streakly_momentum_history';

export interface DailyMomentum {
  date: string;
  score: number;
}

export const useMomentum = () => {
  const { habits, logs, getStreak } = useHabits();

  const momentumData = useMemo(() => {
    // We want the last 30 days
    const last30Days = getLastNDays(30);
    const history: DailyMomentum[] = [];

    // Base value is 10 if habit.value is undefined
    const getBaseValue = (h: Habit) => (h.value !== undefined ? h.value : 10);

    for (const date of last30Days) {
      let dailyScore = 0;
      for (const habit of habits) {
        // Find active streak up to this date
        const streakInfo = getStreak(habit.id, date);
        const streak = streakInfo.current;
        
        const base = getBaseValue(habit);
        // Momentum Compound Formula: Base * (1.05 ^ Streak)
        const compounded = base * Math.pow(1.05, streak);
        dailyScore += compounded;
      }
      history.push({ date, score: Math.round(dailyScore) });
    }

    const todayStr = today();
    const currentScoreObj = history.find(h => h.date === todayStr);
    const currentScore = currentScoreObj ? currentScoreObj.score : 0;

    // Calculate sum of base values to see if multiplier is active
    let baseSum = 0;
    for (const habit of habits) {
      baseSum += getBaseValue(habit);
    }
    
    // Check if score dropped recently (broken chain)
    let droppedRecently = false;
    if (history.length >= 2) {
      const yesterday = history[history.length - 2].score;
      const t = history[history.length - 1].score;
      if (t < yesterday) {
        droppedRecently = true;
      }
    }

    return { history, currentScore, baseSum, droppedRecently };
  }, [habits, logs, getStreak]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCORE, momentumData.currentScore.toString());
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(momentumData.history));
  }, [momentumData]);

  return momentumData;
};
