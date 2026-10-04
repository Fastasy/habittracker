export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'legend';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
}

export interface Rank {
  name: string;
  color: string;
}

export interface GameStats {
  /** Lifetime XP across every tracked action. */
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  rank: Rank;
  /** XP earned today, with streak combos applied. */
  todayXp: number;
  /** Longest streak still running right now. */
  bestCombo: number;
  /** Longest streak ever recorded. */
  longestStreak: number;
  totalCompletions: number;
  /** Days in the last 90 where every scheduled habit was completed. */
  perfectDays: number;
  todayTotal: number;
  todayDone: number;
  todosDone: number;
  todosOpen: number;
  notesWritten: number;
  weightLogs: number;
  goalsCount: number;
  habitsCount: number;
  achievements: Achievement[];
}
