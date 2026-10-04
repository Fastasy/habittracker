import { Achievement, AchievementTier, GameStats } from './types';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  icon: string;
  target: number;
  value: (s: GameStats) => number;
}

/**
 * Achievements are DERIVED, never stored: each one is evaluated from current
 * stats on every render. No unlock table, no schema, nothing to desync — and
 * clearing your data clears your badges with it.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  // --- volume ---
  { id: 'first-blood', name: 'First Blood', description: 'Bank your first check-in', tier: 'bronze', icon: 'zap', target: 1, value: s => s.totalCompletions },
  { id: 'momentum', name: 'Momentum', description: 'Bank 10 check-ins', tier: 'bronze', icon: 'zap', target: 10, value: s => s.totalCompletions },
  { id: 'centurion', name: 'Centurion', description: 'Bank 100 check-ins', tier: 'gold', icon: 'zap', target: 100, value: s => s.totalCompletions },

  // --- streaks / combos ---
  { id: 'unbroken-3', name: 'Warming Up', description: 'Hold a 3-day streak', tier: 'bronze', icon: 'flame', target: 3, value: s => s.longestStreak },
  { id: 'unbroken-7', name: 'Locked In', description: 'Hold a 7-day streak', tier: 'silver', icon: 'flame', target: 7, value: s => s.longestStreak },
  { id: 'unbroken-14', name: 'Relentless', description: 'Hold a 14-day streak', tier: 'gold', icon: 'flame', target: 14, value: s => s.longestStreak },
  { id: 'unbroken-30', name: 'Unbroken', description: 'Hold a 30-day streak', tier: 'legend', icon: 'flame', target: 30, value: s => s.longestStreak },

  // --- flawless days ---
  { id: 'flawless-1', name: 'Clean Sheet', description: 'Clear a full day of quests', tier: 'bronze', icon: 'check', target: 1, value: s => s.perfectDays },
  { id: 'flawless-10', name: 'Dialled', description: 'Clear 10 full days', tier: 'silver', icon: 'check', target: 10, value: s => s.perfectDays },
  { id: 'flawless-30', name: 'Machine', description: 'Clear 30 full days', tier: 'legend', icon: 'check', target: 30, value: s => s.perfectDays },

  // --- campaigns ---
  { id: 'architect', name: 'Architect', description: 'Stand up an objective', tier: 'bronze', icon: 'target', target: 1, value: s => s.goalsCount },
  { id: 'campaigner', name: 'Campaigner', description: 'Run 3 objectives at once', tier: 'silver', icon: 'target', target: 3, value: s => s.goalsCount },

  // --- to-dos ---
  { id: 'executor', name: 'Executor', description: 'Clear 10 to-dos', tier: 'bronze', icon: 'list', target: 10, value: s => s.todosDone },
  { id: 'taskmaster', name: 'Taskmaster', description: 'Clear 50 to-dos', tier: 'gold', icon: 'list', target: 50, value: s => s.todosDone },

  // --- notes / training ---
  { id: 'scribe', name: 'Scribe', description: 'Write 5 daily notes', tier: 'bronze', icon: 'note', target: 5, value: s => s.notesWritten },
  { id: 'chronicler', name: 'Chronicler', description: 'Write 25 daily notes', tier: 'silver', icon: 'note', target: 25, value: s => s.notesWritten },
  { id: 'iron', name: 'Iron', description: 'Log 5 weigh-ins', tier: 'silver', icon: 'dumbbell', target: 5, value: s => s.weightLogs },

  // --- levelling ---
  { id: 'operator-5', name: 'Operator', description: 'Reach level 5', tier: 'silver', icon: 'shield', target: 5, value: s => s.level },
  { id: 'commander-15', name: 'Commander', description: 'Reach level 15', tier: 'gold', icon: 'shield', target: 15, value: s => s.level },
  { id: 'legend-30', name: 'Legend', description: 'Reach level 30', tier: 'legend', icon: 'crown', target: 30, value: s => s.level },
];

export function evaluateAchievements(stats: Omit<GameStats, 'achievements'>): Achievement[] {
  return ACHIEVEMENTS.map(def => {
    const value = Math.max(0, def.value(stats as GameStats));
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      tier: def.tier,
      icon: def.icon,
      progress: Math.min(value, def.target),
      target: def.target,
      unlocked: value >= def.target,
    };
  });
}

export const TIER_STYLE: Record<AchievementTier, { ring: string; text: string; label: string }> = {
  bronze: { ring: '#b45309', text: '#f59e0b', label: 'Bronze' },
  silver: { ring: '#64748b', text: '#cbd5e1', label: 'Silver' },
  gold: { ring: '#a16207', text: '#fbbf24', label: 'Gold' },
  legend: { ring: '#047857', text: '#34d399', label: 'Legend' },
};
