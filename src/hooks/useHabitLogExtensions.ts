import { useState, useEffect } from 'react';

export interface HabitLogExtension {
  amount?: number;
}

const STORAGE_KEY = 'streakly_habit_log_extensions';

export const useHabitLogExtensions = () => {
  const [extensions, setExtensions] = useState<Record<string, HabitLogExtension>>(() => {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extensions));
  }, [extensions]);

  // key is format: `${habitId}_${date}`
  const setLogExtension = (habitId: string, date: string, ext: HabitLogExtension) => {
    const key = `${habitId}_${date}`;
    setExtensions(prev => ({
      ...prev,
      [key]: { ...prev[key], ...ext },
    }));
  };

  const getLogExtension = (habitId: string, date: string): HabitLogExtension => {
    const key = `${habitId}_${date}`;
    return extensions[key] || {};
  };

  const deleteLogExtension = (habitId: string, date: string) => {
    const key = `${habitId}_${date}`;
    setExtensions(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  return {
    logExtensions: extensions,
    setLogExtension,
    getLogExtension,
    deleteLogExtension,
  };
};
