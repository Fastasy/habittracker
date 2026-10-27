import React, { useState } from 'react';
import { Pencil, Trash2, Flame, Trophy, TrendingUp, MoreVertical } from 'lucide-react';
import { Habit, StreakInfo } from '../../types/habit';
import { emojiToIcon } from '../../utils/iconMap';

interface HabitCardProps {
  habit: Habit;
  streak: StreakInfo;
  completionRate: number;
  miniTrend: { week: number; rate: number }[];
  onEdit: () => void;
  onDelete: () => void;
}

const FrequencyBadge: React.FC<{ habit: Habit }> = ({ habit }) => {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let text = '';
  if (habit.frequency === 'daily') text = 'Every day';
  else if (habit.frequency === 'specific_days') {
    text = (habit.specificDays ?? []).map(d => DAY_LABELS[d]).join(', ');
  } else {
    text = `${habit.timesPerWeek}× / week`;
  }
  return (
    <span className="text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 bg-transparent border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full">
      {text}
    </span>
  );
};

const MiniSparkline: React.FC<{ data: { week: number; rate: number }[]; color: string }> = ({ data, color }) => {
  const max = 100;
  const width = 80;
  const height = 24;
  const padding = 2;
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.rate / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - (d.rate / max) * (height - padding * 2);
        return i === data.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        ) : null;
      })}
    </svg>
  );
};

const HabitCard: React.FC<HabitCardProps> = ({ habit, streak, completionRate, miniTrend, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const currentStreak = streak.current;

  return (
    // `relative` is always on: the delete confirmation is an `absolute inset-0`
    // overlay, and without a positioned ancestor it escaped to the viewport.
    <div className="relative bg-zinc-50 dark:bg-zinc-900/40 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800/80 p-3.5 md:p-4 transition-all duration-200 group flex flex-col gap-3.5 md:gap-4">

      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: habit.color + '15', color: habit.color }}
          >
            {emojiToIcon(habit.emoji, "w-5 h-5")}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide text-sm truncate">{habit.name}</h3>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <FrequencyBadge habit={habit} />

              {currentStreak >= 2 && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded border text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/25 tabular-nums"
                  title="Active streak"
                >
                  🔥 {currentStreak}d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu — always visible so touch users can reach it */}
        <div className="relative flex-shrink-0 -mt-1 -mr-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={`Actions for ${habit.name}`}
            aria-expanded={menuOpen}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-zinc-400 active:text-zinc-600 dark:active:text-zinc-300 active:bg-zinc-200/50 dark:active:bg-zinc-800 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-40 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 z-20 overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="w-full flex items-center gap-2 px-4 min-h-[48px] text-sm font-medium text-zinc-700 dark:text-zinc-300 active:bg-zinc-50 dark:active:bg-zinc-800 transition-colors"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                className="w-full flex items-center gap-2 px-4 min-h-[48px] text-sm font-medium text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 items-center">
        <div className="col-span-3 grid grid-cols-3 gap-1.5 md:gap-2">
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg py-1.5 px-1 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Flame className="w-3 h-3 flex-shrink-0" style={{ color: habit.color }} />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">Streak</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: habit.color }}>{streak.current}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg py-1.5 px-1 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Trophy className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">Best</span>
            </div>
            <p className="text-sm font-semibold text-amber-500">{streak.longest}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg py-1.5 px-1 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 truncate">Rate</span>
            </div>
            <p className="text-sm font-semibold text-emerald-500">{completionRate}%</p>
          </div>
        </div>
        <div className="col-span-1 flex items-center justify-end">
          {miniTrend.length > 1 && (
            <MiniSparkline data={miniTrend} color={habit.color} />
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 p-4 z-20">
          <p className="text-center text-xs font-medium text-zinc-800 dark:text-zinc-200">
            Delete <strong>"{habit.name}"</strong>?
            <br />
            <span className="text-zinc-500 font-normal">All logs will be lost.</span>
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 min-h-[44px] rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirmDelete(false); onDelete(); }}
              className="flex-1 min-h-[44px] rounded-lg bg-red-500/10 active:bg-red-500/20 text-red-600 border border-red-500/20 text-xs font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitCard;
