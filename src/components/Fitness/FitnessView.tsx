import React, { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Target } from 'lucide-react';
import { DateRangeFilter } from '../../types/habit';
import { getLastNDays, toDateString } from '../../utils/dateUtils';
import WeightChart from '../Analytics/WeightChart';
import { motion } from 'framer-motion';

interface FitnessViewProps {
  getWeightLog: (date: string) => number | undefined;
  logWeight: (date: string, weight: number) => void;
  getWeightLogs: (days: string[]) => { date: string; weight: number | null }[];
}

const FILTER_OPTIONS: { label: string; value: DateRangeFilter }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'All time', value: 'all' },
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-blue-500" />
            Fitness Tracker
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Log your daily weight and track your fitness metrics.
          </p>
        </div>
      </header>

      {/* Weight Logger Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-5 mb-8 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-xl">⚖️</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Today's Weight</p>
              <p className="font-medium text-zinc-900 dark:text-white text-sm">
                Log for {selectedDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value));
                }
              }}
              className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="0.0"
                className="w-24 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-right font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">kg</span>
            <button
              onClick={handleSaveWeight}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors ml-2 shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>

      {/* Chart Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Trend Analysis</h3>
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDateFilter(opt.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                dateFilter === opt.value
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      
      <WeightChart data={weightData} />
    </div>
  );
};

export default FitnessView;
