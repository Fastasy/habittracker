import { useState, useEffect } from 'react';

export interface HabitExtension {
  pillarId?: string;
  value?: number;
  isQuantifiable?: boolean;
  targetAmount?: number;
  unit?: string;
}

const STORAGE_KEY = 'streakly_habit_extensions';

export const useHabitExtensions = () => {
  const [extensions, setExtensions] = useState<Record<string, HabitExtension>>(() => {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extensions));
  }, [extensions]);

  const setExtension = (habitId: string, ext: HabitExtension) => {
    setExtensions(prev => ({
      ...prev,
      [habitId]: { ...prev[habitId], ...ext },
    }));
  };

  const getExtension = (habitId: string): HabitExtension => {
    return extensions[habitId] || {};
  };

  const deleteExtension = (habitId: string) => {
    setExtensions(prev => {
      const copy = { ...prev };
      delete copy[habitId];
      return copy;
    });
  };

  return {
    extensions,
    setExtension,
    getExtension,
    deleteExtension,
  };
};
