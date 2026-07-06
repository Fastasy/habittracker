import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Habits</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {habits.length === 0 ? 'No habits yet' : `${habits.length} habit${habits.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:block">New Habit</span>
        </button>
      </div>

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start Your Journey</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
            Build the habits that will transform your life. Small steps, consistently taken, lead to extraordinary results.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Your First Habit
          </button>
        </div>
      )}

      {/* Habit grid */}
      {habits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center justify-center gap-3 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all min-h-[200px] group"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-violet-500 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-violet-500 transition-colors">Add Habit</span>
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
