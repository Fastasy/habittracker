export type FrequencyType = 'daily' | 'specific_days' | 'times_per_week';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: FrequencyType;
  specificDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  timesPerWeek?: number;
  createdAt: string; // ISO date string
  archivedAt?: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO timestamp
}

export interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
}

export interface StreakInfo {
  current: number;
  longest: number;
}

export type ViewType = 'today' | 'habits' | 'analytics';

export type DateRangeFilter = '7d' | '30d' | 'all';
