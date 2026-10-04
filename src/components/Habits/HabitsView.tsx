import React, { useState } from 'react';
import { Plus, LayoutList } from 'lucide-react';
import { Habit } from '../../types/habit';
import { useHabits } from '../../hooks/useHabits';
import HabitCard from './HabitCard';
import HabitModal from './HabitModal';
import { getLastNDays } from '../../utils/dateUtils';

interface HabitsViewProps {
  habits: ReturnType<typeof useHabits>['habits'];
  onAdd: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  getStreak: ReturnType<typeof useHabits>['getStreak'];
  getCompletionRate: ReturnType<typeof useHabits>['getCompletionRate'];
  getHabitMiniTrend: ReturnType<typeof useHabits>['getHabitMiniTrend'];
}

const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onAdd,
  onUpdate,
  onDelete,
  getStreak,
  getCompletionRate,
  getHabitMiniTrend,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const last30Days = getLastNDays(30);

  const handleSave = (data: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      onUpdate(editingHabit.id, data);
    } else {
      onAdd(data);
    }
    setShowModal(false);
    setEditingHabit(null);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingHabit(null);
  };

  return (
    <div className="max-w-5xl mx-auto pt-4">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">Quest Log</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 tracking-wide mt-1">
            {habits.length === 0 ? 'No quests configured' : `${habits.length} quest${habits.length !== 1 ? 's' : ''} active`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium rounded-lg shadow-sm transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:block">New Quest</span>
        </button>
      </div>

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="text-center py-20 px-6 border border-dashed border-zinc-300 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-5 text-zinc-400">
            <LayoutList className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">System Empty</h3>
          <p className="text-xs text-zinc-500 tracking-wide max-w-sm mx-auto mb-6">
            You haven't defined any routines yet. Start by creating your first habit below.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium rounded-lg shadow-sm transition-all text-xs uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Quest
          </button>
        </div>
      )}

      {/* Habit grid */}
      {habits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={getStreak(habit.id)}
              completionRate={getCompletionRate(habit.id, last30Days)}
              miniTrend={getHabitMiniTrend(habit.id, 8)}
              onEdit={() => handleEdit(habit)}
              onDelete={() => onDelete(habit.id)}
            />
          ))}
          {/* Add button card */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-transparent rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700/80 p-5 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all min-h-[160px] group"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
              <Plus className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 group-hover:text-emerald-500 transition-colors">Add Quest</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <HabitModal
          habit={editingHabit}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default HabitsView;
