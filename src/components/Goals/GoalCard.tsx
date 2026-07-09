import React from 'react';
import { Target, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Goal, Habit } from '../../types/habit';

interface GoalCardProps {
  goal: Goal;
  habits: Habit[];
  onEdit: () => void;
  onDelete: () => void;
  getCompletionRate: (habitId: string, days: string[]) => number;
  latestWeight?: number;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, habits, onEdit, onDelete, getCompletionRate, latestWeight }) => {
  // To keep it simple, we'll calculate the average completion rate over the last 30 days for linked habits.
  // In a real scenario, you might want to use the overall completion rate.
  const today = new Date();
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const linkedHabits = habits.filter(h => h.goalId === goal.id);
  
  let averageRate = 0;
  if (linkedHabits.length > 0) {
    const totalRate = linkedHabits.reduce((sum, h) => sum + getCompletionRate(h.id, last30Days), 0);
    averageRate = Math.round(totalRate / linkedHabits.length);
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${goal.color} shadow-sm text-white`}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">{goal.name}</h3>
            {goal.deadline && (
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(goal.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{goal.description}</p>
      )}

      <div className="mb-4">
        {goal.targetWeight !== undefined ? (
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Weight Goal ({goal.targetWeight}kg)</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                {latestWeight !== undefined ? `${latestWeight}kg` : 'No data'}
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${goal.color} transition-all duration-500 ease-out`} 
                style={{ width: `${Math.min(100, Math.max(0, latestWeight ? (goal.targetWeight / latestWeight) * 100 : 0))}%` }} 
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Overall Progress (30d)</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{averageRate}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${goal.color} transition-all duration-500 ease-out`} 
                style={{ width: `${averageRate}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Linked Habits</h4>
        {linkedHabits.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">No habits linked yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {linkedHabits.map(habit => (
              <span key={habit.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                <span>{habit.emoji}</span>
                {habit.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
