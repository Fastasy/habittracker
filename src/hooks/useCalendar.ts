import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Todo } from '../types/calendar';

/**
 * Calendar data — a to-do list and a free-text note, per day.
 *
 * Persisted in Supabase (tables `todos` and `calendar_days`, both RLS-scoped to
 * auth.uid() = user_id) so it syncs across devices like habits/goals/weight.
 * Updates are optimistic: state changes immediately, the write fires after.
 *
 * A to-do may optionally be linked to a goal (todos.goal_id -> goals.id). The
 * link is one shared instance owned by App, so the Calendar and an Objective
 * card always show the same thing.
 */
export const useCalendar = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Keep a live ref so handlers can read the current list without going stale.
  const todosRef = useRef<Todo[]>([]);
  useEffect(() => { todosRef.current = todos; }, [todos]);

  useEffect(() => {
    const load = async () => {
      try {
        const [todosRes, notesRes] = await Promise.all([
          supabase.from('todos').select('*'),
          supabase.from('calendar_days').select('*'),
        ]);

        if (todosRes.error) throw todosRes.error;
        if (notesRes.error) throw notesRes.error;

        setTodos((todosRes.data ?? []).map(t => ({
          id: t.id,
          date: t.date,
          text: t.text,
          done: t.done,
          goalId: t.goal_id ?? undefined,
        })));

        const map: Record<string, string> = {};
        (notesRes.data ?? []).forEach(n => {
          if (n.note) map[n.date] = n.note;
        });
        setNotes(map);
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const addTodo = useCallback((date: string, text: string, goalId?: string) => {
    const clean = text.trim();
    if (!clean) return;
    const id = crypto.randomUUID();

    setTodos(prev => [...prev, { id, date, text: clean, done: false, goalId }]);
    supabase.from('todos').insert({ id, date, text: clean, done: false, goal_id: goalId || null })
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    const current = todosRef.current.find(t => t.id === id);
    if (!current) return;
    const done = !current.done;

    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done } : t)));
    supabase.from('todos').update({ done }).eq('id', id)
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    supabase.from('todos').delete().eq('id', id)
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  /** Link (or unlink) a to-do to a goal. */
  const setTodoGoal = useCallback((id: string, goalId?: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, goalId } : t)));
    supabase.from('todos').update({ goal_id: goalId || null }).eq('id', id)
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  /**
   * Drop local links to a deleted goal. The database does this itself via
   * `on delete set null`; this keeps the UI honest without a refetch.
   */
  const clearGoalLinks = useCallback((goalId: string) => {
    setTodos(prev => prev.map(t => (t.goalId === goalId ? { ...t, goalId: undefined } : t)));
  }, []);

  const saveNote = useCallback((date: string, note: string) => {
    setNotes(prev => {
      const copy = { ...prev };
      if (note) copy[date] = note;
      else delete copy[date];
      return copy;
    });

    supabase.from('calendar_days')
      .upsert(
        { date, note, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,date' }
      )
      .then(res => { if (res.error) console.error(res.error); });
  }, []);

  const todosFor = useCallback((date: string) => todos.filter(t => t.date === date), [todos]);
  const openCount = useCallback((date: string) => todos.filter(t => t.date === date && !t.done).length, [todos]);
  const doneCount = useCallback((date: string) => todos.filter(t => t.date === date && t.done).length, [todos]);
  const noteFor = useCallback((date: string) => notes[date] ?? '', [notes]);
  const todosForGoal = useCallback((goalId: string) => todos.filter(t => t.goalId === goalId), [todos]);
  const openCountForGoal = useCallback(
    (goalId: string) => todos.filter(t => t.goalId === goalId && !t.done).length,
    [todos]
  );

  return {
    todos,
    notes,
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
    setTodoGoal,
    clearGoalLinks,
    saveNote,
    todosFor,
    openCount,
    doneCount,
    noteFor,
    todosForGoal,
    openCountForGoal,
  };
};

export type CalendarApi = ReturnType<typeof useCalendar>;
