import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { Goal, Habit } from '../../types/habit';
import GoalCard from './GoalCard';
import GoalModal from './GoalModal';

interface GoalsViewProps {
  goals: Goal[];
  habits: Habit[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Goal;
  onUpdateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  onDeleteGoal: (id: string) => void;
  setHabitGoal: (habitId: string, goalId?: string) => void;
  getCompletionRate: (habitId: string, days: string[]) => number;
  latestWeight?: number;
}

const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  habits,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  setHabitGoal,
  getCompletionRate,
  latestWeight
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  const handleOpenModal = (goal?: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>, selectedHabits: string[]) => {
    let goalIdToUse = editingGoal?.id;

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, goalData);
    } else {
      const newGoal = onAddGoal(goalData);
      goalIdToUse = newGoal.id;
    }

    // Update habit linkages
    if (goalIdToUse) {
      // Find habits previously linked to this goal, but now unselected
      habits.forEach(h => {
        if (h.goalId === goalIdToUse && !selectedHabits.includes(h.id)) {
          setHabitGoal(h.id, undefined);
        }
      });
      // Set the goalId for all selected habits
      selectedHabits.forEach(id => {
        setHabitGoal(id, goalIdToUse);
      });
    }

    setIsModalOpen(false);
    setEditingGoal(undefined);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      onDeleteGoal(id);
      // Remove goalId from any linked habits
      habits.forEach(h => {
        if (h.goalId === id) {
          setHabitGoal(h.id, undefined);
        }
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-yellow-500" />
            My Goals
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Group your habits and track your big picture progress.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Goal
        </button>
      </header>

      {goals.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-600 dark:text-yellow-500">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Goals Yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
            Create high-level goals and link your daily habits to them to see how your small wins add up to big achievements.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              habits={habits}
              getCompletionRate={getCompletionRate}
              latestWeight={latestWeight}
              onEdit={() => handleOpenModal(goal)}
              onDelete={() => handleDeleteGoal(goal.id)}
            />
          ))}
        </div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(undefined);
        }}
        onSave={handleSaveGoal}
        habits={habits}
        existingGoal={editingGoal}
        existingHabitIds={editingGoal ? habits.filter(h => h.goalId === editingGoal.id).map(h => h.id) : []}
      />
    </div>
  );
};

export default GoalsView;
