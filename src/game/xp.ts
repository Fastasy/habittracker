import { Habit, HabitLog } from '../types/habit';
import { getLast365Days, isHabitScheduledForDate, today, toDateString } from '../utils/dateUtils';
import { Rank } from './types';

/**
 * XP + levelling.
 *
 * XP is DERIVED from data the app already stores — nothing new is persisted, so
 * the numbers can never drift out of sync with your actual history.
 */

/** Base XP for completing one habit. */
export const XP_HABIT = 10;
/** XP for clearing a to-do. */
export const XP_TODO = 5;
/** XP for standing up an objective. */
export const XP_GOAL = 25;
/** XP for logging a weigh-in. */
export const XP_WEIGH_IN = 10;

/**
 * Streak combo. Every consecutive day banks +10%, capped at +100% (2×).
 * Deliberately capped so a long streak is a big reward, not an infinite one.
 */
export const comboMultiplier = (streak: number): number =>
  1 + Math.min(Math.max(streak - 1, 0), 10) * 0.1;

/** XP a single habit check-in is worth, given the streak it was part of. */
export const completionXp = (streak: number): number =>
  Math.round(XP_HABIT * comboMultiplier(streak));

/** Total XP needed to advance FROM `level` to the next one. */
export const xpToNext = (level: number): number => 100 + (level - 1) * 50;

/** XP already banked when entering `level`. */
export function xpAtLevelStart(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpToNext(l);
  return total;
}

export function levelFromXp(totalXp: number): {
  level: number; xpIntoLevel: number; xpForNext: number;
} {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level++;
    if (level > 999) break; // sanity guard
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpToNext(level) };
}

const RANK_BANDS: { min: number; name: string; color: string }[] = [
  { min: 1, name: 'Initiate', color: '#a1a1aa' },
  { min: 3, name: 'Operator', color: '#38bdf8' },
  { min: 6, name: 'Tactician', color: '#818cf8' },
  { min: 10, name: 'Vanguard', color: '#a78bfa' },
  { min: 15, name: 'Commander', color: '#fbbf24' },
  { min: 20, name: 'Ascendant', color: '#f97316' },
  { min: 30, name: 'Legend', color: '#34d399' },
];

export function rankFor(level: number): Rank {
  let band = RANK_BANDS[0];
  for (const b of RANK_BANDS) if (level >= b.min) band = b;
  return { name: band.name, color: band.color };
}

/** The next rank up, and how many levels away it is. */
export function nextRank(level: number): { name: string; color: string; levelsAway: number } | null {
  const ahead = RANK_BANDS.filter(b => b.min > level).sort((a, b) => a.min - b.min)[0];
  return ahead ? { name: ahead.name, color: ahead.color, levelsAway: ahead.min - level } : null;
}

/** Is this habit scheduled on the given day? (re-exported for the XP replay) */
export const scheduledOn = (habit: Habit, iso: string) => isHabitScheduledForDate(habit, iso);

export interface XpBreakdown {
  habitXp: number;
  todayXp: number;
  totalCompletions: number;
}

/**
 * Replays each habit's history and awards XP per check-in, scaled by the combo
 * that check-in was part of. A missed scheduled day resets the combo.
 */
export function computeHabitXp(habits: Habit[], logs: HabitLog[]): XpBreakdown {
  const days = getLast365Days();
  const done = new Set(logs.filter(l => l.completed).map(l => `${l.habitId}|${l.date}`));
  const todayIso = today();

  let habitXp = 0;
  let todayXp = 0;
  let totalCompletions = 0;

  for (const habit of habits) {
    const scheduled = days.filter(d => isHabitScheduledForDate(habit, d));
    let streak = 0;
    for (const d of scheduled) {
      if (done.has(`${habit.id}|${d}`)) {
        streak++;
        // A check-in only banks its combo once the following day confirms the
        // streak — otherwise every habit would pay 10 XP on day one and 20 on
        // day two with no act of consistency in between.
        const paidFor = Math.max(1, streak - 1);
        const xp = completionXp(paidFor);
        habitXp += xp;
        if (d === todayIso) todayXp += xp;
        totalCompletions++;
      } else {
        streak = 0;
      }
    }
  }

  return { habitXp, todayXp, totalCompletions };
}

/** Perfect days in the last 90: every scheduled habit completed, at least one. */
export function countPerfectDays(habits: Habit[], logs: HabitLog[], windowDays = 90): number {
  if (habits.length === 0) return 0;
  const done = new Set(logs.filter(l => l.completed).map(l => `${l.habitId}|${l.date}`));
  const days = getLast365Days().slice(-windowDays);
  const todayIso = toDateString(new Date());

  let perfect = 0;
  for (const d of days) {
    if (d === todayIso) continue; // today isn't finished yet
    const scheduled = habits.filter(h => isHabitScheduledForDate(h, d));
    if (scheduled.length === 0) continue;
    if (scheduled.every(h => done.has(`${h.id}|${d}`))) perfect++;
  }
  return perfect;
}
