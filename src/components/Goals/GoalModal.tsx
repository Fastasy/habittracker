import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Goal, Habit } from '../../types/habit';
import { emojiToIcon } from '../../utils/iconMap';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'createdAt'>, selectedHabits: string[]) => void;
  habits: Habit[];
  existingGoal?: Goal;
  existingHabitIds?: string[];
}

const COLORS = [
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e',
  '#ef4444', '#f97316', '#f59e0b', '#eab308'
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
  const [color, setColor] = useState(COLORS[0]);
  const [deadline, setDeadline] = useState('');
  const [trackWeight, setTrackWeight] = useState(false);
  const [targetWeight, setTargetWeight] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingGoal) {
        setName(existingGoal.name);
        setDescription(existingGoal.description || '');
        setColor(existingGoal.color?.startsWith('#') ? existingGoal.color : COLORS[0]);
        setDeadline(existingGoal.deadline || '');
        setTrackWeight(existingGoal.targetWeight !== undefined);
        setTargetWeight(existingGoal.targetWeight ? existingGoal.targetWeight.toString() : '');
        setSelectedHabits(existingHabitIds);
      } else {
        setName('');
        setDescription('');
        setColor(COLORS[0]);
        setDeadline('');
        setTrackWeight(false);
        setTargetWeight('');
        setSelectedHabits([]);
      }
      setNameError('');
    }
  }, [isOpen, existingGoal, existingHabitIds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Please specify an objective name');
      return;
    }
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-zinc-50 dark:bg-zinc-950 rounded-t-3xl md:rounded-xl border-t md:border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-md max-h-[92dvh] md:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-2 p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800/80 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
            {existingGoal ? 'Configure Objective' : 'Initialize Objective'}
          </h2>
          <button onClick={onClose} aria-label="Close" className="w-11 h-11 -mr-2 flex items-center justify-center rounded-md text-zinc-400 active:text-zinc-600 dark:active:text-zinc-300 active:bg-zinc-200/50 dark:active:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto overscroll-contain overflow-x-hidden">
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Objective Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                placeholder="e.g. Q3 Fitness Benchmark"
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details and success criteria..."
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Accent Color</label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Accent ${c}`}
                    aria-pressed={color === c}
                    className={`w-11 h-11 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-transform active:scale-105 border border-transparent ${
                      color === c ? 'ring-2 ring-zinc-950 dark:ring-white ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Date (Optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-3 group py-1 -my-1">
                <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors border flex-shrink-0 ${
                  trackWeight 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
                }`}>
                  {trackWeight && <Check className="w-4 h-4" strokeWidth={3} />}
                </div>
                <input
                  type="checkbox"
                  checked={trackWeight}
                  onChange={(e) => setTrackWeight(e.target.checked)}
                  className="hidden"
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 transition-colors">Bind to Weight Metrics</span>
              </label>
              
              {trackWeight && (
                <div className="pl-6">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="e.g. 75.0"
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Correlated Habits</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                {habits.length === 0 ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">No habits registered.</p>
                ) : (
                  habits.map(habit => (
                    <label 
                      key={habit.id} 
                      className={`flex items-center gap-3 min-h-[52px] p-2.5 rounded-lg cursor-pointer transition-all border ${
                        selectedHabits.includes(habit.id)
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors border flex-shrink-0 ${
                        selectedHabits.includes(habit.id)
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'
                      }`}>
                        {selectedHabits.includes(habit.id) && <Check className="w-4 h-4" strokeWidth={3} />}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedHabits.includes(habit.id)}
                        onChange={() => toggleHabit(habit.id)}
                        className="hidden"
                      />
                      <span className="text-zinc-400 dark:text-zinc-500">
                        {emojiToIcon(habit.emoji, "w-4 h-4")}
                      </span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{habit.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 md:p-5 border-t border-zinc-200 dark:border-zinc-800/80 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-950/50 shrink-0 safe-bottom-sheet">
          <button
            type="button"
            onClick={onClose}
            className="px-5 min-h-[48px] text-sm font-medium text-zinc-700 dark:text-zinc-300 active:bg-zinc-200 dark:active:bg-zinc-800 rounded-lg transition-colors border border-transparent"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="goal-form"
            className="px-5 min-h-[48px] text-sm font-semibold text-white bg-emerald-500 active:bg-emerald-600 rounded-lg transition-all shadow-md"
          >
            {existingGoal ? 'Save Campaign' : 'Launch Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
