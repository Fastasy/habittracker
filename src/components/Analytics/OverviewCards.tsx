import React from 'react';
import { Target, Flame, CheckCircle2, TrendingUp } from 'lucide-react';

interface OverviewCardsProps {
  totalHabits: number;
  weeklyRate: number;
  monthlyRate: number;
  longestStreak: number;
  totalCheckIns: number;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}> = ({ icon, label, value, sub }) => (
  <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-xl p-5 border border-zinc-200 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
        {sub && <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-2">{sub}</p>}
      </div>
      <div className="text-zinc-400 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors">
        {icon}
      </div>
    </div>
    
    {/* Subtle gradient accent on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:to-emerald-500/5 pointer-events-none transition-all duration-500" />
  </div>
);

const OverviewCards: React.FC<OverviewCardsProps> = ({
  totalHabits,
  weeklyRate,
  monthlyRate,
  longestStreak,
  totalCheckIns,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Target className="w-5 h-5" />}
        label="Active Routines"
        value={totalHabits}
        sub={totalHabits === 1 ? 'tracked module' : 'tracked modules'}
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="7D Adherence"
        value={`${weeklyRate}%`}
        sub={`${monthlyRate}% 30D avg`}
      />
      <StatCard
        icon={<Flame className="w-5 h-5" />}
        label="Peak Velocity"
        value={`${longestStreak}d`}
        sub="max sustained"
      />
      <StatCard
        icon={<CheckCircle2 className="w-5 h-5" />}
        label="Cumulative Hits"
        value={totalCheckIns.toLocaleString()}
        sub="all-time events"
      />
    </div>
  );
};

export default OverviewCards;
