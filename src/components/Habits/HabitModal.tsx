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

const inputCls = 'w-full px-3 py-3 md:py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all';

interface HabitModalProps {
  habit?: Habit | null;
  onSave: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

/**
 * Quest editor. A bottom sheet on phones (so the on-screen keyboard has
 * somewhere to live) and a centred dialog from `md` up. Actions are pinned to
 * the bottom of the sheet and the body scrolls under them.
 */
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-zinc-50 dark:bg-zinc-950 rounded-t-3xl md:rounded-xl border-t md:border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-md max-h-[92dvh] md:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800/80 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
            {habit ? 'Configure Routine' : 'Initialize Routine'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 -mr-2 flex items-center justify-center rounded-md text-zinc-400 active:text-zinc-600 dark:active:text-zinc-300 active:bg-zinc-200/50 dark:active:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="p-4 md:p-6 space-y-5 md:space-y-6 overflow-y-auto overscroll-contain flex-1">
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
                className={inputCls}
              />
              {nameError && <p className="text-red-500 text-xs mt-1.5">{nameError}</p>}
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
                  className={inputCls}
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
                  className={inputCls}
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">Assign positive or negative {valueConfig.symbol} for completing this routine.</p>
              </div>
            )}

            {/* Quantifiable Habit */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Quantifiable Target
                </label>
                <label className="relative inline-flex items-center cursor-pointer p-2.5 -m-2.5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isQuantifiable}
                    onChange={e => setIsQuantifiable(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[12px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
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
                      className={inputCls}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      placeholder="e.g. pages, km"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
              {isQuantifiable && (
                <p className="text-[11px] text-zinc-500 mt-2">Instead of a checkbox, you'll log the exact amount completed each day.</p>
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
                  className={`flex-1 min-h-[44px] text-xs font-semibold rounded-md transition-all ${
                    !isBad
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-500'
                  }`}
                >
                  Positive
                </button>
                <button
                  type="button"
                  onClick={() => setIsBad(true)}
                  className={`flex-1 min-h-[44px] text-xs font-semibold rounded-md transition-all ${
                    isBad
                      ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-500'
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
              <div className="flex flex-wrap gap-1.5 md:gap-2 max-h-36 overflow-y-auto overscroll-contain p-1.5 scrollbar-hide border border-zinc-200 dark:border-zinc-800/80 rounded-lg bg-white dark:bg-zinc-900/50">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    aria-label={`Icon ${e}`}
                    aria-pressed={emoji === e}
                    className={`w-11 h-11 rounded-md flex items-center justify-center transition-all ${
                      emoji === e
                        ? 'ring-1 ring-emerald-500 bg-emerald-500/10 text-emerald-500'
                        : 'text-zinc-400 active:bg-zinc-100 dark:active:bg-zinc-800'
                    }`}
                  >
                    {emojiToIcon(e, "w-5 h-5")}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Accent Color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={color === c.value}
                    className={`w-11 h-11 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-transform active:scale-105 border border-transparent ${
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
                    className={`min-h-[44px] px-1.5 rounded-lg text-xs font-medium transition-all border ${
                      frequency === opt.value
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
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
                      aria-label={DAY_FULL[idx]}
                      aria-pressed={specificDays.includes(idx)}
                      className={`flex-1 aspect-square min-h-[44px] rounded-md text-xs font-bold transition-all border ${
                        specificDays.includes(idx)
                          ? 'border-transparent text-white shadow-sm'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500'
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
                      aria-label="Fewer times per week"
                      className="w-11 h-11 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold flex items-center justify-center active:bg-zinc-300 dark:active:bg-zinc-700"
                    >
                      −
                    </button>
                    <span
                      className="w-8 text-center text-base font-bold tabular-nums"
                      style={{ color }}
                    >
                      {timesPerWeek}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTimesPerWeek(Math.min(7, timesPerWeek + 1))}
                      aria-label="More times per week"
                      className="w-11 h-11 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold flex items-center justify-center active:bg-zinc-300 dark:active:bg-zinc-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-sm">
              <p className="text-[11px] font-bold text-zinc-400 mb-3 uppercase tracking-widest">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
                  style={{ backgroundColor: color + '15', color: color }}
                >
                  {emojiToIcon(emoji, "w-5 h-5")}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm tracking-wide text-zinc-900 dark:text-zinc-100 truncate">{name || 'Routine Name'}</p>
                  <p className="text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mt-0.5">
                    {frequency === 'daily' && 'Every day'}
                    {frequency === 'specific_days' && specificDays.length > 0 && DAY_FULL.filter((_, i) => specificDays.includes(i)).join(', ')}
                    {frequency === 'times_per_week' && `${timesPerWeek}x / week`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions — pinned, so they never scroll away under the keyboard */}
          <div className="shrink-0 flex gap-3 p-4 md:p-5 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 safe-bottom-sheet">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[48px] rounded-lg bg-emerald-500 active:bg-emerald-600 text-white text-sm font-semibold shadow-md transition-all"
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
