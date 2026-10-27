import React, { useState, useEffect } from 'react';
import { Check, Plus } from 'lucide-react';
import { Habit } from '../../types/habit';
import { emojiToIcon } from '../../utils/iconMap';

interface HabitCheckItemProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  currentAmount?: number;
  onLogAmount?: (amount: number) => void;
  /** Current streak, shown as a run counter. */
  streak?: number;
}

/**
 * One quest row on the Command board.
 *
 * The row itself is the tap target (keyed off `data-tap-row`), which is what
 * lets the visual checkbox stay 28px while the thumb gets ~330x64px. The
 * checkbox button is padded out to a full 44px hit area anyway, because on
 * touch a control that *looks* like the thing to press gets pressed.
 */
const HabitCheckItem: React.FC<HabitCheckItemProps> = ({ habit, completed, onToggle, currentAmount = 0, onLogAmount, streak = 0 }) => {
  const [justCompleted, setJustCompleted] = useState(false);
  const [tempAmount, setTempAmount] = useState(currentAmount.toString());

  useEffect(() => {
    setTempAmount(currentAmount.toString());
  }, [currentAmount]);

  const handleToggle = () => {
    if (habit.isQuantifiable) return; // Ignore click on the row if it's quantifiable (must use input)
    if (!completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 300);
    }
    onToggle();
  };

  const handleLogAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogAmount) {
      onLogAmount(Number(tempAmount));
    }
  };

  const progressPct = habit.isQuantifiable && habit.targetAmount
    ? Math.min(100, (currentAmount / habit.targetAmount) * 100)
    : 0;

  return (
    <div
      data-tap-row={habit.id}
      className={`relative flex flex-wrap items-center gap-3 md:gap-4 p-3 md:p-4 min-h-[64px] rounded-xl border transition-all duration-200 ${!habit.isQuantifiable ? 'cursor-pointer active:bg-zinc-100 dark:active:bg-zinc-800/50' : ''} select-none group ${
        completed
          ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80'
          : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 md:hover:border-zinc-300 md:dark:hover:border-zinc-700/80 md:hover:bg-zinc-50 md:dark:hover:bg-zinc-800/40'
      }`}
      onClick={handleToggle}
    >
      {/* Checkbox or Progress Ring */}
      <div className="relative flex-shrink-0">
        {!habit.isQuantifiable ? (
          <button
            aria-label={completed ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
            aria-pressed={completed}
            className="relative -m-2 p-2 w-11 h-11 flex items-center justify-center rounded-lg"
            onClick={e => { e.stopPropagation(); handleToggle(); }}
          >
            <span
              className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all duration-200 ${
                justCompleted ? 'scale-110' : 'scale-100'
              } ${
                completed
                  ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'border-zinc-300 dark:border-zinc-600 bg-transparent group-hover:border-emerald-500/50'
              }`}
            >
              {completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </span>
          </button>
        ) : (
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="none" className="text-zinc-200 dark:text-zinc-800" />
              <circle
                cx="16" cy="16" r="14"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - progressPct / 100)}`}
                className={`transition-all duration-500 ${completed ? 'text-emerald-500' : 'text-emerald-400'}`}
              />
            </svg>
            {completed && <Check className="absolute w-4 h-4 text-emerald-500" strokeWidth={3} />}
          </div>
        )}
      </div>

      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          completed ? 'opacity-40 grayscale' : 'opacity-80 group-hover:opacity-100'
        }`}
        style={{
          color: habit.color,
          backgroundColor: completed ? 'transparent' : habit.color + '15',
        }}
      >
        {emojiToIcon(habit.emoji, "w-5 h-5")}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-[140px]">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`font-medium tracking-wide transition-all duration-200 truncate ${
              completed
                ? 'text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700/50'
                : habit.isBad
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {habit.name}
          </p>
          {streak >= 2 && (
            <span
              className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/25 tabular-nums"
              title="Current streak"
            >
              🔥 {streak}d
            </span>
          )}
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-widest flex items-center gap-2">
          {habit.isQuantifiable ? (
            <span className={completed ? "text-emerald-500/70" : "text-emerald-500 font-bold"}>
              {currentAmount} / {habit.targetAmount} {habit.unit}
            </span>
          ) : (
            <>
              {habit.frequency === 'daily' && 'Every day'}
              {habit.frequency === 'specific_days' &&
                (habit.specificDays ?? [])
                  .sort((a, b) => a - b)
                  .map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                  .join(', ')}
              {habit.frequency === 'times_per_week' && `${habit.timesPerWeek}× / week`}
            </>
          )}
        </p>
      </div>

      {/* Input for Quantifiable */}
      {habit.isQuantifiable ? (
        <form onSubmit={handleLogAmount} className="flex-shrink-0 flex items-center justify-end gap-2 w-full md:w-auto pt-2.5 md:pt-0 border-t border-zinc-100 dark:border-zinc-800/60 md:border-0" onClick={e => e.stopPropagation()}>
          <input
            type="number"
            min="0"
            value={tempAmount}
            aria-label={`Amount completed for ${habit.name}`}
            onChange={e => setTempAmount(e.target.value)}
            className="w-20 md:w-16 px-2 py-2 text-sm text-right bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            aria-label={`Add one to ${habit.name}`}
            onClick={() => {
              const newAmt = Math.min((habit.targetAmount || 0), currentAmount + 1);
              setTempAmount(newAmt.toString());
              onLogAmount?.(newAmt);
            }}
            className="w-11 h-11 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 active:text-emerald-500 dark:active:text-emerald-400 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="submit"
            className="min-h-[44px] px-3.5 text-xs font-semibold rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
          >
            Log
          </button>
        </form>
      ) : (
        /* Done badge */
        completed && (
          <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <Check className="w-3 h-3" strokeWidth={3} />
            {habit.isBad ? 'Avoided' : 'Done'}
          </div>
        )
      )}
    </div>
  );
};

export default HabitCheckItem;
