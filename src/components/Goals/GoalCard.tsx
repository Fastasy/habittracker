import React from 'react';
import { Calendar, Edit2, Trash2, Crosshair, ListTodo, Undo2, X } from 'lucide-react';
import { Goal, Habit, StreakInfo } from '../../types/habit';
import { Todo } from '../../types/calendar';
import { emojiToIcon } from '../../utils/iconMap';
import { toDateString } from '../../utils/dateUtils';
import { isMissed, isCarriedIn, shortDate } from '../../utils/todoUtils';

interface GoalCardProps {
  goal: Goal;
  habits: Habit[];
  onEdit: () => void;
  onDelete: () => void;
  getCompletionRate: (habitId: string, days: string[]) => number;
  latestWeight?: number;
  /** To-dos linked to this objective (two-way with the Calendar view). */
  todos?: Todo[];
  onToggleTodo?: (id: string) => void;
  /** Live streak of each linked quest, for the combo readout. */
  getStreak?: (habitId: string) => StreakInfo;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal, habits, onEdit, onDelete, getCompletionRate, latestWeight, todos = [], onToggleTodo, getStreak,
}) => {
  const today = new Date();
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const linkedHabits = habits.filter(h => h.goalId === goal.id);
  const openTodos = todos.filter(t => !t.done).length;
  const todayIso = toDateString(new Date());
  const missedTodos = todos.filter(t => isMissed(t, todayIso)).length;
  
  let averageRate = 0;
  if (linkedHabits.length > 0) {
    const totalRate = linkedHabits.reduce((sum, h) => sum + getCompletionRate(h.id, last30Days), 0);
    averageRate = Math.round(totalRate / linkedHabits.length);
  }

  // Extract color hex if it's a tailwind class (e.g. bg-blue-500). In our new system, we just use a fallback or the custom color system.
  // We'll use emerald as the primary accent, but if the goal has a specific color, we can use it.
  const accentColor = goal.color?.startsWith('#') ? goal.color : '#10b981'; 

  return (
    <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 md:p-5 shadow-sm transition-all group relative overflow-hidden">
      {/* Subtle top border indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <Crosshair className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide text-sm truncate">{goal.name}</h3>
            {goal.deadline && (
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(goal.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {/* Always visible — a hover-revealed control does not exist on touch. */}
        <div className="flex items-center gap-0.5 -mt-1 -mr-1 flex-shrink-0 transition-opacity">
          <button onClick={onEdit} aria-label={`Edit ${goal.name}`} className="w-11 h-11 flex items-center justify-center text-zinc-400 active:text-zinc-900 dark:active:text-zinc-100 active:bg-zinc-100 dark:active:bg-zinc-800 rounded-md transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} aria-label={`Delete ${goal.name}`} className="w-11 h-11 flex items-center justify-center text-zinc-400 active:text-red-500 active:bg-red-50 dark:active:bg-red-900/20 rounded-md transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">{goal.description}</p>
      )}

      <div className="mb-5">
        {goal.targetWeight !== undefined ? (
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Weight Goal ({goal.targetWeight}kg)</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white tracking-wide">
                {latestWeight !== undefined ? `${latestWeight}kg` : 'No data'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out" 
                style={{ 
                  width: `${Math.min(100, Math.max(0, latestWeight ? (goal.targetWeight / latestWeight) * 100 : 0))}%`,
                  backgroundColor: accentColor 
                }} 
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">30d Aggregate</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white tracking-wide">{averageRate}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out" 
                style={{ 
                  width: `${averageRate}%`,
                  backgroundColor: accentColor
                }} 
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-[10px] font-bold text-zinc-500 mb-2.5 uppercase tracking-widest">Linked Quests</h4>
        {linkedHabits.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">No quests linked.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {linkedHabits.map(habit => {
              const streak = getStreak ? getStreak(habit.id).current : 0;
              return (
                <span 
                  key={habit.id} 
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/50 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                >
                  <span className="text-[10px]">{emojiToIcon(habit.emoji, "w-3 h-3")}</span>
                  {habit.name}
                  {streak >= 2 && (
                    <span className="text-orange-500 font-bold" title={`${streak}-day streak`}>🔥{streak}</span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Linked to-dos — two-way with the Calendar view */}
      <div className="mt-4">
        <h4 className="text-[10px] font-bold text-zinc-500 mb-2.5 uppercase tracking-widest flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <ListTodo className="w-3 h-3" />
            Linked To-dos
          </span>
          <span className={missedTodos > 0 ? 'text-red-500' : openTodos > 0 ? 'text-amber-600 dark:text-amber-400' : ''}>
            {todos.length === 0
              ? '—'
              : missedTodos > 0
                ? `${openTodos} open · ${missedTodos} missed`
                : openTodos > 0
                  ? `${openTodos} open`
                  : 'all done'}
          </span>
        </h4>
        {todos.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">
            No to-dos linked. Link one from the Calendar.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {todos.slice(0, 4).map(t => (
              <li key={t.id} className="flex items-start gap-1" data-goal-todo={t.id}>
                {isMissed(t, todayIso) ? (
                  <button
                    onClick={() => onToggleTodo?.(t.id)}
                    disabled={!onToggleTodo}
                    data-goal-todo-missed={t.id}
                    aria-label="Not completed — mark as done"
                    title={`Not done on ${shortDate(t.date)} — click to mark it done`}
                    className="-m-2.5 p-2.5 flex-shrink-0 flex items-center justify-center disabled:opacity-50"
                  >
                    <span className="w-6 h-6 rounded-md border border-red-500/60 bg-red-500/15 text-red-500 flex items-center justify-center active:bg-red-500/25 transition-colors">
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    </span>
                  </button>
                ) : (
                  <label className="-m-2.5 p-2.5 flex-shrink-0 flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => onToggleTodo?.(t.id)}
                      disabled={!onToggleTodo}
                      aria-label={`Mark "${t.text}" as done`}
                      className="w-6 h-6 flex-shrink-0 accent-emerald-500 cursor-pointer disabled:opacity-50"
                    />
                  </label>
                )}
                <span
                  className={`flex-1 min-w-0 text-xs break-words py-1.5 ${
                    t.done
                      ? 'line-through text-zinc-400 dark:text-zinc-600'
                      : isMissed(t, todayIso)
                        ? 'line-through text-red-500/75 dark:text-red-400/60'
                        : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {t.text}
                </span>
                {/* Same rule as the Calendar: the marker is for work still owed. */}
                {isCarriedIn(t) && !t.done && (
                  <Undo2
                    className="w-4 h-4 mt-2 flex-shrink-0 text-amber-500"
                    aria-label={`Rolled over from ${shortDate(t.carriedFrom!)}`}
                  />
                )}
                <span
                  className={`flex-shrink-0 mt-2 text-[11px] tabular-nums ${
                    isCarriedIn(t) && !t.done ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  {new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
              </li>
            ))}
            {todos.length > 4 && (
              <li className="text-[11px] text-zinc-500 pl-6">+{todos.length - 4} more</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
