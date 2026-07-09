export type FrequencyType = 'daily' | 'specific_days' | 'times_per_week';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  color: string;
  deadline?: string;
  targetWeight?: number;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isBad?: boolean;
  frequency: FrequencyType;
  specificDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  timesPerWeek?: number;
  createdAt: string; // ISO date string
  archivedAt?: string;
  goalId?: string;
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

export type ViewType = 'today' | 'habits' | 'analytics' | 'settings' | 'goals' | 'fitness';

export type DateRangeFilter = '7d' | '30d' | 'all';
