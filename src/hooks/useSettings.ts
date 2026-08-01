import { useState, useEffect } from 'react';
import { Pillar, ValueConfig, DisciplineConfig, ExportConfig } from '../types/settings';

const STORAGE_KEYS = {
  PILLARS: 'streakly_pillars',
  VALUE_CONFIG: 'streakly_value_config',
  DISCIPLINE_CONFIG: 'streakly_discipline_config',
  EXPORT_CONFIG: 'streakly_export_config',
};

const DEFAULT_PILLARS: Pillar[] = [
  { id: '1', name: 'Health & Fitness', color: '#10b981', icon: '🏃' },
  { id: '2', name: 'Deep Work', color: '#3b82f6', icon: '💻' },
  { id: '3', name: 'Mindfulness', color: '#8b5cf6', icon: '🧘' },
];

const DEFAULT_VALUE_CONFIG: ValueConfig = {
  active: false,
  symbol: 'pts',
  target: 500,
};

const DEFAULT_DISCIPLINE_CONFIG: DisciplineConfig = {
  threshold: 80,
  message: 'At this rate, your goals are slipping. Reclaim your focus.',
};

const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  template: `---
Date: {{date}}
Discipline Status: {{discipline_status}}
Pillars Completed: {{pillar_stats}}
---
# Daily Progress Report
- Completed: {{completed_habits}}
- Missed: {{missed_habits}}
Value Accumulated: {{value_accumulated}}`,
};

export const useSettings = () => {
  // Helpers to get/set local storage
  const loadItem = <T,>(key: string, defaultVal: T): T => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  };

  const saveItem = <T,>(key: string, val: T) => {
    localStorage.setItem(key, JSON.stringify(val));
  };

  // States
  const [pillars, setPillars] = useState<Pillar[]>(() => loadItem(STORAGE_KEYS.PILLARS, DEFAULT_PILLARS));
  const [valueConfig, setValueConfig] = useState<ValueConfig>(() => loadItem(STORAGE_KEYS.VALUE_CONFIG, DEFAULT_VALUE_CONFIG));
  const [disciplineConfig, setDisciplineConfig] = useState<DisciplineConfig>(() => loadItem(STORAGE_KEYS.DISCIPLINE_CONFIG, DEFAULT_DISCIPLINE_CONFIG));
  const [exportConfig, setExportConfig] = useState<ExportConfig>(() => loadItem(STORAGE_KEYS.EXPORT_CONFIG, DEFAULT_EXPORT_CONFIG));

  // Sync state to local storage when changed
  useEffect(() => {
    saveItem(STORAGE_KEYS.PILLARS, pillars);
  }, [pillars]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.VALUE_CONFIG, valueConfig);
  }, [valueConfig]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.DISCIPLINE_CONFIG, disciplineConfig);
  }, [disciplineConfig]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.EXPORT_CONFIG, exportConfig);
  }, [exportConfig]);

  // Pillar Actions
  const addPillar = (pillar: Omit<Pillar, 'id'>) => {
    const newPillar = { ...pillar, id: crypto.randomUUID() };
    setPillars(prev => [...prev, newPillar]);
  };

  const updatePillar = (id: string, updates: Partial<Omit<Pillar, 'id'>>) => {
    setPillars(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePillar = (id: string) => {
    setPillars(prev => prev.filter(p => p.id !== id));
  };

  return {
    pillars,
    addPillar,
    updatePillar,
    deletePillar,
    valueConfig,
    setValueConfig,
    disciplineConfig,
    setDisciplineConfig,
    exportConfig,
    setExportConfig,
  };
};
