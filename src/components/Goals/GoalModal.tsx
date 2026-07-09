import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Goal, Habit } from '../../types/habit';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'createdAt'>, selectedHabits: string[]) => void;
  habits: Habit[];
  existingGoal?: Goal;
  existingHabitIds?: string[];
}

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
];

const GoalModal: React.FC<GoalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  habits,
  existingGoal,
  existingHabitIds = []
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[4]);
  const [deadline, setDeadline] = useState('');
  const [trackWeight, setTrackWeight] = useState(false);
  const [targetWeight, setTargetWeight] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (existingGoal) {
        setName(existingGoal.name);
        setDescription(existingGoal.description || '');
        setColor(existingGoal.color);
        setDeadline(existingGoal.deadline || '');
        setTrackWeight(existingGoal.targetWeight !== undefined);
        setTargetWeight(existingGoal.targetWeight ? existingGoal.targetWeight.toString() : '');
        setSelectedHabits(existingHabitIds);
      } else {
        setName('');
        setDescription('');
        setColor(COLORS[4]);
        setDeadline('');
        setTrackWeight(false);
        setTargetWeight('');
        setSelectedHabits([]);
      }
    }
  }, [isOpen, existingGoal, existingHabitIds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedWeight = trackWeight && targetWeight ? parseFloat(targetWeight) : undefined;

    onSave(
      { 
        name: name.trim(), 
        description: description.trim(), 
        color, 
        deadline: deadline || undefined,
        targetWeight: !isNaN(parsedWeight as any) ? parsedWeight : undefined
      },
      selectedHabits
    );
    onClose();
  };

  const toggleHabit = (id: string) => {
    setSelectedHabits(prev => 
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {existingGoal ? 'Edit Goal' : 'New Goal'}
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Get Fit"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Reach my target weight by summer"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white dark:ring-offset-zinc-900' : ''}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Deadline (Optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={trackWeight}
                  onChange={(e) => setTrackWeight(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Link to Weight Tracker</span>
              </label>
              
              {trackWeight && (
                <div className="mt-2 pl-6">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="e.g. 75.0"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Linked Habits</label>
              <div className="space-y-2">
                {habits.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No habits available.</p>
                ) : (
                  habits.map(habit => (
                    <label key={habit.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors border border-zinc-100 dark:border-zinc-800">
                      <input
                        type="checkbox"
                        checked={selectedHabits.includes(habit.id)}
                        onChange={() => toggleHabit(habit.id)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-xl">{habit.emoji}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{habit.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="goal-form"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Save Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
