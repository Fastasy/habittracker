import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Todo } from '../types/calendar';
import { today } from '../utils/dateUtils';
import { byCarriedFirst } from '../utils/todoUtils';

/** A row as Supabase returns it (snake_case) before mapping to `Todo`. */
interface TodoRow {
  id: string;
  date: string;
  text: string;
  done: boolean;
  goal_id?: string | null;
  carried_from?: string | null;
  carried_to?: string | null;
}

const mapTodo = (t: TodoRow): Todo => ({
  id: t.id,
  date: t.date,
  text: t.text,
  done: t.done,
  goalId: t.goal_id ?? undefined,
  carriedFrom: t.carried_from ?? undefined,
  carriedTo: t.carried_to ?? undefined,
});

/**
 * Roll every unfinished to-do from an earlier day onto today.
 *
 * The to-do is COPIED, never moved: the row for the day it was missed stays
 * exactly where it is, so that day keeps showing what did not get done (a red
 * X) instead of quietly forgetting it. The copy lands on today carrying
 * `carried_from`, the first day the to-do was ever written.
 *
 * Idempotency is the hard part — this runs on every load, and two tabs (or a
 * React double-mount) can run it at the same instant. So the source row is
 * claimed with a single conditional UPDATE:
 *
 *     update todos set carried_to = <today> where id = ? and carried_to is null
 *
 * That statement is atomic, so exactly one caller can ever win it; only the
 * winner inserts the copy. Anything else would duplicate the to-do — the bug
 * would look like the app inventing work.
 *
 * Everyone's unfinished to-dos roll, not just yesterday's: if the app isn't
 * opened for three days, the debt from three days ago still lands on today
 * (once) rather than being stranded on a day nobody visits.
 */
const carryOverDue = async (rows: TodoRow[]): Promise<TodoRow[]> => {
  const todayIso = today();
  const due = rows.filter(r => !r.done && !r.carried_to && r.date < todayIso);
  if (due.length === 0) return rows;

  const copies: TodoRow[] = [];
  const claimed = new Set<string>();

  for (const src of due) {
    const claim = await supabase
      .from('todos')
      .update({ carried_to: todayIso })
      .eq('id', src.id)
      .is('carried_to', null)
      .select('id');

    if (claim.error) {
      console.error('Carry-over: could not claim to-do', src.id, claim.error);
      continue;
    }
    // Lost the race to another tab, or it was already rolled earlier today.
    if (!claim.data || claim.data.length === 0) continue;

    const copy: TodoRow = {
      id: crypto.randomUUID(),
      date: todayIso,
      text: src.text,
      done: false,
      goal_id: src.goal_id ?? null,
      carried_from: src.carried_from ?? src.date,
      carried_to: null,
    };

    const ins = await supabase.from('todos').insert(copy);
    if (ins.error) {
      console.error('Carry-over: could not copy to-do', src.id, ins.error);
      // Release the claim so the next load retries instead of losing the to-do.
      await supabase.from('todos').update({ carried_to: null }).eq('id', src.id);
      continue;
    }

    copies.push(copy);
    claimed.add(src.id);
  }

  if (copies.length === 0) return rows;
  return [
    ...rows.map(r => (claimed.has(r.id) ? { ...r, carried_to: todayIso } : r)),
    ...copies,
  ];
};

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

  const load = useCallback(async (initial = false) => {
    try {
      const [todosRes, notesRes] = await Promise.all([
        supabase.from('todos').select('*'),
        supabase.from('calendar_days').select('*'),
      ]);

      if (todosRes.error) throw todosRes.error;
      if (notesRes.error) throw notesRes.error;

      const rows = await carryOverDue((todosRes.data ?? []) as TodoRow[]);
      setTodos(rows.map(mapTodo));

      const map: Record<string, string> = {};
      (notesRes.data ?? []).forEach(n => {
        if (n.note) map[n.date] = n.note;
      });
      setNotes(map);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      if (initial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  /**
   * The day can turn while the app sits open overnight — on the next focus,
   * re-run the load so the roll-over actually fires instead of the view keeping
   * yesterday's date. `isLoading` is deliberately left alone: flipping it would
   * remount the note editor and wipe an in-flight draft.
   */
  const loadedDay = useRef(today());
  useEffect(() => {
    const check = () => {
      if (today() === loadedDay.current) return;
      loadedDay.current = today();
      load();
    };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [load]);

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

  /** One day's to-dos, roll-overs first. */
  const todosFor = useCallback(
    (date: string) => todos.filter(t => t.date === date).sort(byCarriedFirst),
    [todos]
  );
  const openCount = useCallback((date: string) => todos.filter(t => t.date === date && !t.done).length, [todos]);
  const doneCount = useCallback((date: string) => todos.filter(t => t.date === date && t.done).length, [todos]);
  /** Unfinished to-dos on a day that has already been and gone. */
  const missedCount = useCallback(
    (date: string) => todos.filter(t => t.date === date && !t.done && date < today()).length,
    [todos]
  );
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
    missedCount,
    noteFor,
    todosForGoal,
    openCountForGoal,
  };
};

export type CalendarApi = ReturnType<typeof useCalendar>;
