import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { Goal, Habit } from '../../types/habit';
import { Todo } from '../../types/calendar';
import GoalCard from './GoalCard';
import GoalModal from './GoalModal';

interface GoalsViewProps {
  goals: Goal[];
  habits: Habit[];
  todos: Todo[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Goal;
  onUpdateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  onDeleteGoal: (id: string) => void;
  setHabitGoal: (habitId: string, goalId?: string) => void;
  onToggleTodo: (id: string) => void;
  onClearGoalTodoLinks: (goalId: string) => void;
  getCompletionRate: (habitId: string, days: string[]) => number;
  getStreak?: (habitId: string) => { current: number; longest: number };
  latestWeight?: number;
}

const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  habits,
  todos,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  setHabitGoal,
  onToggleTodo,
  onClearGoalTodoLinks,
  getCompletionRate,
  getStreak,
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

    if (goalIdToUse) {
      habits.forEach(h => {
        if (h.goalId === goalIdToUse && !selectedHabits.includes(h.id)) {
          setHabitGoal(h.id, undefined);
        }
      });
      selectedHabits.forEach(id => {
        setHabitGoal(id, goalIdToUse);
      });
    }

    setIsModalOpen(false);
    setEditingGoal(undefined);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to terminate this objective?')) {
      onDeleteGoal(id);
      habits.forEach(h => {
        if (h.goalId === id) {
          setHabitGoal(h.id, undefined);
        }
      });
      // The DB clears todos.goal_id via `on delete set null`; mirror it locally
      // so the Calendar doesn't show a link to an objective that no longer exists.
      onClearGoalTodoLinks(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Campaigns
          </h2>
          <p className="text-sm text-zinc-500 tracking-wide mt-1">
            Long-haul objectives. Link quests and to-dos to push them forward.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold rounded-lg transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </header>

      {goals.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-950 rounded-lg flex items-center justify-center mx-auto mb-4 text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2 tracking-wide">No Active Campaigns</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
            Define a high-level objective and map quests to it to track aggregate performance.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              habits={habits}
              todos={todos.filter(t => t.goalId === goal.id)}
              onToggleTodo={onToggleTodo}
              getStreak={getStreak}
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
