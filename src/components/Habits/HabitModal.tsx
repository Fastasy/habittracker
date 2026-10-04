import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Habit, FrequencyType } from '../../types/habit';
import { emojiToIcon } from '../../utils/iconMap';
import { useSettings } from '../../hooks/useSettings';

const EMOJI_OPTIONS = [
  '🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎵',
  '🌿', '🚴', '🧹', '💊', '🫁', '🧠', '🌅', '🙏', '🎨', '💻',
  '🌳', '🐕', '🚿', '🛌', '☕', '🍎', '🏋️', '🤸', '📝', '🌙',
];

const COLOR_OPTIONS = [
  { label: 'Emerald', value: '#10b981' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Fuchsia', value: '#d946ef' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Yellow', value: '#eab308' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitModalProps {
  habit?: Habit | null;
  onSave: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const HabitModal: React.FC<HabitModalProps> = ({ habit, onSave, onClose }) => {
  const { pillars, valueConfig } = useSettings();

  const [name, setName] = useState(habit?.name ?? '');
  const [emoji, setEmoji] = useState(habit?.emoji ?? '🎯');
  const [color, setColor] = useState(habit?.color ?? '#10b981');
  const [frequency, setFrequency] = useState<FrequencyType>(habit?.frequency ?? 'daily');
  const [specificDays, setSpecificDays] = useState<number[]>(habit?.specificDays ?? [1, 2, 3, 4, 5]);
  const [timesPerWeek, setTimesPerWeek] = useState(habit?.timesPerWeek ?? 3);
  const [isBad, setIsBad] = useState(habit?.isBad ?? false);
  const [pillarId, setPillarId] = useState<string>(habit?.pillarId ?? (pillars.length > 0 ? pillars[0].id : ''));
  const [value, setValue] = useState<number | undefined>(habit?.value);
  
  const [isQuantifiable, setIsQuantifiable] = useState(habit?.isQuantifiable ?? false);
  const [targetAmount, setTargetAmount] = useState(habit?.targetAmount ?? 1);
  const [unit, setUnit] = useState(habit?.unit ?? '');

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
    if (pillars.length > 0 && !pillarId) {
      setNameError('Please select a pillar');
      return;
    }
    if (isQuantifiable && targetAmount <= 0) {
      setNameError('Target amount must be greater than zero');
      return;
    }
    onSave({
      name: name.trim(),
      emoji,
      color,
      frequency,
      specificDays: frequency === 'specific_days' ? specificDays : undefined,
      timesPerWeek: frequency === 'times_per_week' ? timesPerWeek : undefined,
      isBad,
      pillarId: pillars.length > 0 ? pillarId : undefined,
      value: valueConfig.active ? value : undefined,
      isQuantifiable,
      targetAmount: isQuantifiable ? targetAmount : undefined,
      unit: isQuantifiable ? unit.trim() : undefined,
    });
  };

  const toggleDay = (day: number) => {
    setSpecificDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800/80">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
            {habit ? 'Configure Routine' : 'Initialize Routine'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Routine Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(''); }}
              placeholder="e.g., Morning Run, Read 20 pages..."
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          {/* Pillar Mapping */}
          {pillars.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Pillar Mapping
              </label>
              <select
                value={pillarId}
                onChange={e => setPillarId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="" disabled>Select a Pillar</option>
                {pillars.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Value Tracking */}
          {valueConfig.active && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Value Assignment ({valueConfig.symbol})
              </label>
              <input
                type="number"
                value={value ?? ''}
                onChange={e => setValue(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={`Value (+/- ${valueConfig.symbol})`}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Assign positive or negative {valueConfig.symbol} for completing this routine.</p>
            </div>
          )}

          {/* Quantifiable Habit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
                Quantifiable Target
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isQuantifiable}
                  onChange={e => setIsQuantifiable(e.target.checked)}
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            {isQuantifiable && (
              <div className="flex gap-3 mt-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={e => setTargetAmount(Number(e.target.value))}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="e.g. pages, km"
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}
            {isQuantifiable && (
              <p className="text-[10px] text-zinc-500 mt-2">Instead of a checkbox, you'll log the exact amount completed each day.</p>
            )}
          </div>

          {/* Habit Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Behavior Type
            </label>
            <div className="flex bg-zinc-200 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-300/50 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsBad(false)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  !isBad
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Positive
              </button>
              <button
                type="button"
                onClick={() => setIsBad(true)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  isBad
                    ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Negative
              </button>
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Iconography
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 scrollbar-hide border border-zinc-200 dark:border-zinc-800/80 rounded-lg bg-white dark:bg-zinc-900/50">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'ring-1 ring-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {emojiToIcon(e, "w-4 h-4")}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 border border-transparent ${
                    color === c.value ? 'ring-2 ring-zinc-950 dark:ring-white ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Cadence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'daily', label: 'Every Day' },
                { value: 'specific_days', label: 'Specific Days' },
                { value: 'times_per_week', label: 'X / Week' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value as FrequencyType)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    frequency === opt.value
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700'
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
                    className={`flex-1 aspect-square rounded-md text-xs font-bold transition-all border ${
                      specificDays.includes(idx)
                        ? 'border-transparent text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
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
                <span className="text-xs text-zinc-500">Frequency:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTimesPerWeek(Math.max(1, timesPerWeek - 1))}
                    className="w-7 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  >
                    −
                  </button>
                  <span
                    className="w-6 text-center text-sm font-bold"
                    style={{ color }}
                  >
                    {timesPerWeek}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTimesPerWeek(Math.min(7, timesPerWeek + 1))}
                    className="w-7 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                style={{ backgroundColor: color + '15', color: color }}
              >
                {emojiToIcon(emoji, "w-5 h-5")}
              </div>
              <div>
                <p className="font-semibold text-sm tracking-wide text-zinc-900 dark:text-zinc-100">{name || 'Routine Name'}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mt-0.5">
                  {frequency === 'daily' && 'Every day'}
                  {frequency === 'specific_days' && specificDays.length > 0 && DAY_FULL.filter((_, i) => specificDays.includes(i)).join(', ')}
                  {frequency === 'times_per_week' && `${timesPerWeek}x / week`}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              {habit ? 'Save Quest' : 'Deploy Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;
