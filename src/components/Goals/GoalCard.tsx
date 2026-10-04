import React from 'react';
import { Target, Calendar, Edit2, Trash2, Crosshair } from 'lucide-react';
import { Goal, Habit } from '../../types/habit';
import { emojiToIcon } from '../../utils/iconMap';

interface GoalCardProps {
  goal: Goal;
  habits: Habit[];
  onEdit: () => void;
  onDelete: () => void;
  getCompletionRate: (habitId: string, days: string[]) => number;
  latestWeight?: number;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, habits, onEdit, onDelete, getCompletionRate, latestWeight }) => {
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

  // Extract color hex if it's a tailwind class (e.g. bg-blue-500). In our new system, we just use a fallback or the custom color system.
  // We'll use emerald as the primary accent, but if the goal has a specific color, we can use it.
  const accentColor = goal.color?.startsWith('#') ? goal.color : '#10b981'; 

  return (
    <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      {/* Subtle top border indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide text-sm">{goal.name}</h3>
            {goal.deadline && (
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(goal.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
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
        <h4 className="text-[9px] font-bold text-zinc-500 mb-2.5 uppercase tracking-widest">Correlated Habits</h4>
        {linkedHabits.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">No habits linked.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {linkedHabits.map(habit => (
              <span 
                key={habit.id} 
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/50 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
              >
                <span className="text-[10px]">{emojiToIcon(habit.emoji, "w-3 h-3")}</span>
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
