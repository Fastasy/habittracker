import React, { useState } from 'react';
import { Pencil, Trash2, Flame, Trophy, TrendingUp, MoreVertical } from 'lucide-react';
import { Habit, StreakInfo } from '../../types/habit';

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
    text = `${habit.timesPerWeek}× per week`;
  }
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
      {text}
    </span>
  );
};

const MiniSparkline: React.FC<{ data: { week: number; rate: number }[]; color: string }> = ({ data, color }) => {
  const max = 100;
  const width = 80;
  const height = 28;
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - (d.rate / max) * (height - padding * 2);
        return i === data.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        ) : null;
      })}
    </svg>
  );
};

const HabitCard: React.FC<HabitCardProps> = ({ habit, streak, completionRate, miniTrend, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-200 relative group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0"
            style={{ backgroundColor: habit.color + '18', border: `2px solid ${habit.color}30` }}
          >
            {habit.emoji}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{habit.name}</h3>
            <FrequencyBadge habit={habit} />
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10 overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-3.5 h-3.5" style={{ color: habit.color }} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Streak</span>
          </div>
          <p className="text-xl font-bold" style={{ color: habit.color }}>{streak.current}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">days</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Best</span>
          </div>
          <p className="text-xl font-bold text-amber-500">{streak.longest}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">days</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Rate</span>
          </div>
          <p className="text-xl font-bold text-emerald-500">{completionRate}%</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">30d</p>
        </div>
      </div>

      {/* Mini trend sparkline */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">8-week trend</span>
        {miniTrend.length > 1 && (
          <MiniSparkline data={miniTrend} color={habit.color} />
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 rounded-2xl flex flex-col items-center justify-center gap-4 p-6 z-10">
          <p className="text-center text-sm font-medium text-gray-800 dark:text-gray-200">
            Delete <strong>"{habit.name}"</strong>?<br />
            <span className="text-gray-500 dark:text-gray-400 font-normal">All logs will be lost.</span>
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirmDelete(false); onDelete(); }}
              className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
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
