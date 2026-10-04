import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Todo } from '../types/calendar';

/**
 * Calendar data — a to-do list and a free-text note, per day.
 *
 * Persisted in Supabase (tables `todos` and `calendar_days`, both RLS-scoped to
 * auth.uid() = user_id) so it syncs across devices like habits/goals/weight.
 * Updates are optimistic: state changes immediately, the write fires after.
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

  const addTodo = useCallback((date: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const id = crypto.randomUUID();

    setTodos(prev => [...prev, { id, date, text: clean, done: false }]);
    supabase.from('todos').insert({ id, date, text: clean, done: false })
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

  return {
    todos,
    notes,
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
    saveNote,
    todosFor,
    openCount,
    doneCount,
    noteFor,
  };
};
