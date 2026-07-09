import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Goal } from '../types/habit';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const loadGoals = async () => {
      const { data, error } = await supabase.from('goals').select('*');
      if (error) {
        console.error('Failed to load goals:', error);
        return;
      }
      if (data) {
        setGoals(data.map(g => ({
          id: g.id,
          name: g.name,
          description: g.description,
          color: g.color,
          deadline: g.deadline,
          targetWeight: g.target_weight,
          createdAt: new Date(g.created_at).toISOString(),
        })));
      }
    };
    
    loadGoals();
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newGoal: Goal = {
      ...goal,
      id,
      createdAt,
    };
    setGoals(prev => [...prev, newGoal]);
    
    supabase.from('goals').insert({
      id,
      name: goal.name,
      description: goal.description,
      color: goal.color,
      deadline: goal.deadline,
      target_weight: goal.targetWeight,
      created_at: createdAt
    }).then(res => { if (res.error) console.error(res.error); });
    
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
    
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
    if (updates.targetWeight !== undefined) dbUpdates.target_weight = updates.targetWeight;

    supabase.from('goals').update(dbUpdates).eq('id', id)
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    
    supabase.from('goals').delete().eq('id', id)
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
  };
};
