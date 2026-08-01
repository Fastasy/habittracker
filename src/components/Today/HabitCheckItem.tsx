import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Habit } from '../../types/habit';
import { emojiToIcon } from '../../utils/iconMap';

interface HabitCheckItemProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
}

const HabitCheckItem: React.FC<HabitCheckItemProps> = ({ habit, completed, onToggle }) => {
  const [justCompleted, setJustCompleted] = useState(false);
  const handleToggle = () => {
    if (!completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 300);
    }
    onToggle();
  };

  return (
    <div
      className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group ${
        completed
          ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80'
          : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
      }`}
      onClick={handleToggle}
    >
      {/* Checkbox with animation */}
      <div className="relative flex-shrink-0">
        <button
          className={`relative w-6 h-6 rounded flex items-center justify-center transition-all duration-200 ${
            justCompleted ? 'scale-110' : 'scale-100'
          } ${
            completed 
              ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'border border-zinc-300 dark:border-zinc-600 bg-transparent group-hover:border-emerald-500/50'
          }`}
          onClick={e => { e.stopPropagation(); handleToggle(); }}
        >
          {completed && (
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Icon instead of Emoji */}
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
      <div className="flex-1 min-w-0">
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
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5 uppercase tracking-widest">
          {habit.frequency === 'daily' && 'Every day'}
          {habit.frequency === 'specific_days' &&
            (habit.specificDays ?? [])
              .sort((a, b) => a - b)
              .map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
              .join(', ')}
          {habit.frequency === 'times_per_week' && `${habit.timesPerWeek}× / week`}
        </p>
      </div>

      {/* Done badge */}
      {completed && (
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-3 h-3" strokeWidth={3} />
          {habit.isBad ? 'Avoided' : 'Done'}
        </div>
      )}
    </div>
  );
};

export default HabitCheckItem;
