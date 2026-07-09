import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { WeightLog } from '../types/weight';

export const useWeight = () => {
  const [logs, setLogs] = useState<WeightLog[]>([]);

  useEffect(() => {
    const loadWeight = async () => {
      const { data, error } = await supabase.from('weight_logs').select('*');
      if (error) {
        console.error('Failed to load weight logs:', error);
        return;
      }
      if (data) {
        setLogs(data.map(w => ({
          date: w.date,
          weight: parseFloat(w.weight),
        })));
      }
    };
    
    loadWeight();
  }, []);

  const logWeight = useCallback((date: string, weight: number) => {
    setLogs(prev => {
      const existingIdx = prev.findIndex(l => l.date === date);
      let newLogs = [...prev];
      if (existingIdx >= 0) {
        newLogs[existingIdx] = { date, weight };
      } else {
        newLogs = [...prev, { date, weight }];
      }
      return newLogs;
    });

    supabase.from('weight_logs').upsert(
      { date, weight },
      { onConflict: 'user_id, date' }
    ).then(res => { if (res.error) console.error(res.error); });
  }, []);

  const getWeightLog = useCallback((date: string) => {
    return logs.find(l => l.date === date)?.weight;
  }, [logs]);

  const getWeightLogs = useCallback((days: string[]) => {
    return days.map(date => {
      const log = logs.find(l => l.date === date);
      return {
        date,
        weight: log ? log.weight : null
      };
    });
  }, [logs]);

  return {
    logs,
    logWeight,
    getWeightLog,
    getWeightLogs,
  };
};
