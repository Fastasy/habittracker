import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Scale } from 'lucide-react';
import { DateRangeFilter } from '../../types/habit';
import { getLastNDays, toDateString } from '../../utils/dateUtils';
import WeightChart from '../Analytics/WeightChart';

interface FitnessViewProps {
  getWeightLog: (date: string) => number | undefined;
  logWeight: (date: string, weight: number) => void;
  getWeightLogs: (days: string[]) => { date: string; weight: number | null }[];
}

const FILTER_OPTIONS: { label: string; value: DateRangeFilter }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: 'ALL', value: 'all' },
];

const FitnessView: React.FC<FitnessViewProps> = ({ getWeightLog, logWeight, getWeightLogs }) => {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('30d');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weightInput, setWeightInput] = useState('');

  const dateStr = toDateString(selectedDate);
  const filterDays = useMemo(() => {
    if (dateFilter === '7d') return getLastNDays(7);
    if (dateFilter === '30d') return getLastNDays(30);
    return getLastNDays(180);
  }, [dateFilter]);

  const weightData = useMemo(() => getWeightLogs(filterDays), [filterDays, getWeightLogs]);

  useEffect(() => {
    const w = getWeightLog(dateStr);
    setWeightInput(w ? w.toString() : '');
  }, [dateStr, getWeightLog]);

  const handleSaveWeight = () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val)) {
      logWeight(dateStr, val);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Physiology
          </h2>
          <p className="text-sm text-zinc-500 tracking-wide mt-1">
            Track your biometrics and body composition.
          </p>
        </div>
      </header>

      {/* Weight Logger Widget */}
      <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-xl p-6 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-950 rounded-lg flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Body Mass Index</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-wide">
                Logging for {selectedDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value));
                }
              }}
              className="px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            
            <div className="relative flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="0.0"
                className="w-24 px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-right font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">kg</span>
            </div>
            <button
              onClick={handleSaveWeight}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold rounded-lg transition-all shadow-sm ml-2"
            >
              Commit
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Trend Analysis</h3>
          </div>
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateFilter(opt.value)}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                  dateFilter === opt.value
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/80 shadow-sm h-[350px]">
          <WeightChart data={weightData} />
        </div>
      </div>
    </div>
  );
};

export default FitnessView;
