import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  StickyNote,
  Loader2,
  Target,
  Undo2,
  ArrowRight,
} from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { CalendarApi } from '../../hooks/useCalendar';
import { Goal } from '../../types/habit';
import { toDateString } from '../../utils/dateUtils';
import { isMissed, isCarriedIn, carriedDays, shortDate } from '../../utils/todoUtils';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const card =
  'bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm';

interface CalendarViewProps {
  calendar: CalendarApi;
  goals: Goal[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ calendar, goals }) => {
  const {
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
    setTodoGoal,
    saveNote,
    todosFor,
    openCount,
    doneCount,
    missedCount,
    noteFor,
  } = calendar;

  const todayIso = toDateString(new Date());
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string>(todayIso);

  // The draft is tagged with the day it belongs to, so a re-render can never
  // write one day's text onto another.
  const [noteDraft, setNoteDraft] = useState('');
  const [draftFor, setDraftFor] = useState<string>('');
  const [savedAt, setSavedAt] = useState('');
  const [draft, setDraft] = useState('');
  const [draftGoal, setDraftGoal] = useState('');
  const [linkEditId, setLinkEditId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the selected day's saved note into the editor.
  useEffect(() => {
    setNoteDraft(noteFor(selected));
    setDraftFor(selected);
    setSavedAt('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, isLoading]);

  // Debounced save — "saved as you type", like the CRM's day panel.
  useEffect(() => {
    if (isLoading || draftFor !== selected) return;
    const t = setTimeout(() => {
      // Skip the write when the draft still matches what's stored — this fires
      // once on load after the note is fetched, and would otherwise re-save it.
      if (noteDraft === noteFor(selected)) return;
      saveNote(selected, noteDraft);
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteDraft, selected, draftFor, isLoading]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  // "Open" only counts days that can still be acted on; anything left undone on
  // a day that has passed is "missed" instead — the two are never the same to-do.
  const monthOpen = useMemo(
    () => calendar.todos.filter(t => !t.done && t.date >= todayIso && isSameMonth(parseISO(t.date), month)).length,
    [calendar.todos, month, todayIso]
  );
  const monthMissed = useMemo(
    () => calendar.todos.filter(t => !t.done && t.date < todayIso && isSameMonth(parseISO(t.date), month)).length,
    [calendar.todos, month, todayIso]
  );

  const goalById = (id?: string) => (id ? goals.find(g => g.id === id) : undefined);

  const selectDay = (iso: string) => {
    // Flush the in-flight note before switching days.
    if (draftFor === selected) saveNote(selected, noteDraft);
    setSelected(iso);
    setLinkEditId(null);
    if (!isSameMonth(parseISO(iso), month)) setMonth(startOfMonth(parseISO(iso)));
  };

  const submitTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    addTodo(selected, draft, draftGoal || undefined);
    setDraft('');
    setDraftGoal('');
    inputRef.current?.focus();
  };

  const dayTodos = todosFor(selected);
  const open = openCount(selected);
  const done = doneCount(selected);
  const missed = missedCount(selected);
  const isPast = selected < todayIso;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-20">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Calendar</h2>
        <p className="text-sm text-zinc-500 tracking-wide mt-1">
          A to-do list and a note for every day. Anything left undone rolls onto the next day you open.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-1">
          <button
            onClick={() => setMonth(m => addMonths(m, -1))}
            className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <b className="min-w-[150px] text-center text-sm text-zinc-900 dark:text-zinc-100 tracking-wide">
            {format(month, 'MMMM yyyy')}
          </b>
          <button
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            setMonth(startOfMonth(new Date()));
            setSelected(todayIso);
          }}
          className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Today
        </button>

        <div className="flex-1" />

        <span className="text-xs tracking-wide">
          {monthOpen > 0 && (
            <span className="text-zinc-500">
              {monthOpen} open{monthMissed > 0 ? ' · ' : ''}
            </span>
          )}
          {monthMissed > 0 ? (
            <span className="text-red-500">
              {monthMissed} missed
            </span>
          ) : (
            monthOpen === 0 && <span className="text-zinc-500">Nothing open this month</span>
          )}
        </span>
      </div>

      {/* Split: month grid + day panel */}
      {/* `grid-cols-1` (= minmax(0,1fr)) matters: with no base column the mobile
          track is `auto`, which sizes to max-content and lets wide children push
          the whole page past the viewport. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] items-start">
        {/* ---------------- Month grid ---------------- */}
        <div className={`${card} p-5`}>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
            {format(month, 'MMMM yyyy')}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4 tracking-wide">
            Click any day to open its to-dos and notes.
          </p>

          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WEEKDAYS.map(d => (
              <div
                key={d}
                className="text-center text-[10px] uppercase tracking-widest font-bold text-zinc-500 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map(day => {
              const iso = toDateString(day);
              const inMonth = isSameMonth(day, month);
              const isSel = iso === selected;
              const isTd = isToday(day);
              const openN = openCount(iso);
              const doneN = doneCount(iso);
              const missedN = missedCount(iso);
              const hasNote = !!noteFor(iso);

              return (
                <button
                  key={iso}
                  onClick={() => selectDay(iso)}
                  data-day={iso}
                  className={`min-h-[84px] min-w-0 overflow-hidden rounded-lg border p-1.5 flex flex-col gap-1 text-left transition-all ${
                    inMonth
                      ? 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
                      : 'bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200/60 dark:border-zinc-800/40 opacity-45'
                  } ${
                    isSel
                      ? 'border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${
                      isTd ? 'bg-emerald-500 text-white' : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  <div className="flex flex-wrap gap-1">
                    {/* A day that has passed shows what was MISSED, never "open" */}
                    {missedN > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/25 font-medium">
                        <X className="w-2.5 h-2.5" strokeWidth={3} />
                        {missedN}
                      </span>
                    ) : (
                      openN > 0 && (
                        <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                          {openN}
                        </span>
                      )
                    )}
                    {doneN > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                        <Check className="w-2.5 h-2.5" />
                        {doneN}
                      </span>
                    )}
                    {hasNote && (
                      <span className="inline-flex items-center text-zinc-400 dark:text-zinc-500" title="Has a note">
                        <StickyNote className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- Day panel ---------------- */}
        <div className={`${card} p-5`}>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
            {format(parseISO(selected), 'EEEE, d MMMM yyyy')}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 tracking-wide">
            To-do list and notes for this day — saved as you type.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <>
              {/* To-do list */}
              <div className="mt-5 flex items-center justify-between">
                <b className="text-xs font-bold uppercase tracking-widest text-zinc-500">To-do list</b>
                <span
                  className={`text-[10px] uppercase tracking-widest ${
                    isPast && missed > 0 ? 'text-red-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  {isPast
                    ? missed > 0
                      ? `${missed} missed`
                      : done > 0
                        ? 'all done'
                        : '—'
                    : open > 0
                      ? `${open} open`
                      : done > 0
                        ? 'all done'
                        : '—'}
                </span>
              </div>

              <form onSubmit={submitTodo} className="mt-3 space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Add a to-do (press Enter)"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <div className="flex gap-2">
                  <select
                    value={draftGoal}
                    onChange={e => setDraftGoal(e.target.value)}
                    disabled={goals.length === 0}
                    aria-label="Link to objective"
                    className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">No objective</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </form>

              {dayTodos.length > 0 ? (
                <ul className="mt-3 divide-y divide-dashed divide-zinc-200 dark:divide-zinc-800">
                  {dayTodos.map(t => {
                    const g = goalById(t.goalId);
                    const missed = isMissed(t, todayIso);
                    const carriedIn = isCarriedIn(t);
                    const overdue = carriedDays(t);
                    return (
                      <li key={t.id} className="py-2">
                        <div className="flex items-start gap-3 group">
                          {/* Three states: green check (done), red X (the day
                              ended and it was not done), empty box (still open).
                              The red X is still a button — clicking it marks the
                              to-do done after the fact. */}
                          {missed ? (
                            <button
                              onClick={() => toggleTodo(t.id)}
                              data-todo-missed={t.id}
                              aria-label="Not completed — mark as done"
                              title={`Not done on ${shortDate(t.date)} — click to mark it done`}
                              className="mt-0.5 w-4 h-4 flex-shrink-0 rounded border border-red-500/60 bg-red-500/15 text-red-500 flex items-center justify-center hover:bg-red-500/25 transition-colors"
                            >
                              <X className="w-2.5 h-2.5" strokeWidth={3} />
                            </button>
                          ) : (
                            <input
                              type="checkbox"
                              checked={t.done}
                              onChange={() => toggleTodo(t.id)}
                              className="mt-0.5 w-4 h-4 flex-shrink-0 accent-emerald-500 cursor-pointer"
                            />
                          )}
                          <button
                            onClick={() => toggleTodo(t.id)}
                            className={`flex-1 text-left text-sm break-words transition-colors ${
                              t.done
                                ? 'line-through text-zinc-400 dark:text-zinc-600'
                                : missed
                                  ? 'line-through text-red-500/75 dark:text-red-400/60'
                                  : 'text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                          >
                            {t.text}
                          </button>
                          <button
                            onClick={() => deleteTodo(t.id)}
                            aria-label="Delete to-do"
                            className="flex-shrink-0 p-1 rounded-md text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Roll-over history + goal link */}
                        <div className="ml-7 mt-1.5 flex flex-wrap items-center gap-1">
                          {/* The accountability chip is for work that is STILL
                              owed. Once it is done the miss stays recorded on
                              the day it was missed (red X + "rolled to …"), so
                              the chip stops nagging here. */}
                          {carriedIn && !t.done && (
                            <span
                              data-carry-in={t.id}
                              title={`Not completed on ${shortDate(t.carriedFrom!)} — rolled over to this day`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                            >
                              <Undo2 className="w-2.5 h-2.5" />
                              {`not done ${shortDate(t.carriedFrom!)}`}
                              {overdue > 1 ? ` · ${overdue}d` : ''}
                            </span>
                          )}
                          {!t.done && t.carriedTo && (
                            <span
                              data-carry-out={t.id}
                              title={`Rolled over to ${shortDate(t.carriedTo)}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] text-zinc-500 dark:text-zinc-400"
                            >
                              <ArrowRight className="w-2.5 h-2.5" />
                              {`rolled to ${shortDate(t.carriedTo)}`}
                            </span>
                          )}

                          {linkEditId === t.id ? (
                            <select
                              autoFocus
                              value={t.goalId ?? ''}
                              onChange={e => {
                                setTodoGoal(t.id, e.target.value || undefined);
                                setLinkEditId(null);
                              }}
                              onBlur={() => setLinkEditId(null)}
                              aria-label="Link to objective"
                              className="max-w-full px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-[11px] text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="">No objective</option>
                              {goals.map(goal => (
                                <option key={goal.id} value={goal.id}>
                                  {goal.name}
                                </option>
                              ))}
                            </select>
                          ) : g ? (
                            <button
                              onClick={() => setLinkEditId(t.id)}
                              data-goal-chip={g.id}
                              title="Change or clear the linked objective"
                              className="inline-flex items-center gap-1 max-w-full px-1.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors hover:opacity-80"
                              style={{
                                borderColor: `${g.color?.startsWith('#') ? g.color : '#10b981'}40`,
                                backgroundColor: `${g.color?.startsWith('#') ? g.color : '#10b981'}14`,
                                color: g.color?.startsWith('#') ? g.color : '#10b981',
                              }}
                            >
                              <Target className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">{g.name}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setLinkEditId(t.id)}
                              title="Link this to-do to an objective"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-400 transition-colors"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              goal
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-3 py-6 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                  Nothing on the list yet.
                </div>
              )}

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Notes for the day
                </label>
                <textarea
                  value={noteDraft}
                  onChange={e => setNoteDraft(e.target.value)}
                  placeholder="Meetings, calls, follow-ups, ideas…"
                  rows={7}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-y min-h-[140px]"
                />
                <div className="h-4 mt-1 text-[10px] uppercase tracking-widest text-zinc-500">
                  {savedAt ? `Saved ${savedAt}` : ''}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
