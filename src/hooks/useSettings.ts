import { useState } from 'react';
import { DisciplineConfig } from '../types/settings';

const STORAGE_KEY = 'streakly_discipline_config';

const DEFAULT_DISCIPLINE_CONFIG: DisciplineConfig = {
  threshold: 80,
  message: 'At this rate, your goals are slipping. Reclaim your focus.',
};

/**
 * The 14-day discipline baseline (threshold + warning text). Read-only in the
 * UI — kept in localStorage so a previously customised value still applies.
 */
export const useSettings = () => {
  const [disciplineConfig] = useState<DisciplineConfig>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? { ...DEFAULT_DISCIPLINE_CONFIG, ...JSON.parse(item) } : DEFAULT_DISCIPLINE_CONFIG;
    } catch {
      return DEFAULT_DISCIPLINE_CONFIG;
    }
  });

  return { disciplineConfig };
};
