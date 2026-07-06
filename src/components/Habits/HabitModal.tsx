import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Habit, FrequencyType } from '../../types/habit';

const EMOJI_OPTIONS = [
  '🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎵',
  '🌿', '🚴', '🧹', '💊', '🫁', '🧠', '🌅', '🙏', '🎨', '💻',
  '🌳', '🐕', '🚿', '🛌', '☕', '🍎', '🏋️', '🤸', '📝', '🌙',
];

const COLOR_OPTIONS = [
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Indigo', value: '#4f46e5' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Cyan', value: '#0891b2' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Lime', value: '#65a30d' },
  { label: 'Yellow', value: '#ca8a04' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Pink', value: '#db2777' },
  { label: 'Rose', value: '#e11d48' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitModalProps {
  habit?: Habit | null;
  onSave: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const HabitModal: React.FC<HabitModalProps> = ({ habit, onSave, onClose }) => {
  const [name, setName] = useState(habit?.name ?? '');
  const [emoji, setEmoji] = useState(habit?.emoji ?? '🎯');
  const [color, setColor] = useState(habit?.color ?? '#7c3aed');
  const [frequency, setFrequency] = useState<FrequencyType>(habit?.frequency ?? 'daily');
  const [specificDays, setSpecificDays] = useState<number[]>(habit?.specificDays ?? [1, 2, 3, 4, 5]);
  const [timesPerWeek, setTimesPerWeek] = useState(habit?.timesPerWeek ?? 3);
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Please enter a habit name');
      return;
    }
    if (frequency === 'specific_days' && specificDays.length === 0) {
      setNameError('Please select at least one day');
      return;
    }
    onSave({
      name: name.trim(),
      emoji,
      color,
      frequency,
      specificDays: frequency === 'specific_days' ? specificDays : undefined,
      timesPerWeek: frequency === 'times_per_week' ? timesPerWeek : undefined,
    });
  };

  const toggleDay = (day: number) => {
    setSpecificDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-900">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {habit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(''); }}
              placeholder="e.g., Morning Run, Read 20 pages..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 scale-110'
                      : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c.value }}
                >
                  {color === c.value && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'daily', label: 'Every Day' },
                { value: 'specific_days', label: 'Specific Days' },
                { value: 'times_per_week', label: 'X Times / Week' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value as FrequencyType)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    frequency === opt.value
                      ? 'bg-yellow-600 text-white shadow-md'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Specific days picker */}
            {frequency === 'specific_days' && (
              <div className="mt-3 flex gap-1.5">
                {DAY_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    title={DAY_FULL[idx]}
                    className={`flex-1 aspect-square rounded-lg text-xs font-bold transition-all ${
                      specificDays.includes(idx)
                        ? 'text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                    style={specificDays.includes(idx) ? { backgroundColor: color } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Times per week */}
            {frequency === 'times_per_week' && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Times per week:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTimesPerWeek(Math.max(1, timesPerWeek - 1))}
                    className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-lg flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    −
                  </button>
                  <span
                    className="w-8 text-center text-lg font-bold"
                    style={{ color }}
                  >
                    {timesPerWeek}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTimesPerWeek(Math.min(7, timesPerWeek + 1))}
                    className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-lg flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-800/50">
            <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm"
                style={{ backgroundColor: color + '20', border: `2px solid ${color}40` }}
              >
                {emoji}
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">{name || 'Your Habit'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {frequency === 'daily' && 'Every day'}
                  {frequency === 'specific_days' && specificDays.length > 0 && DAY_FULL.filter((_, i) => specificDays.includes(i)).join(', ')}
                  {frequency === 'times_per_week' && `${timesPerWeek}x per week`}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {habit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;
