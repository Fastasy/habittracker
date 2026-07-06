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
  gradient: string;
  iconBg: string;
}> = ({ icon, label, value, sub, gradient, iconBg }) => (
  <div className={`rounded-2xl p-5 ${gradient} border border-white/20 dark:border-gray-800 relative overflow-hidden`}>
    <div className="relative z-10">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
    </div>
    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5 dark:bg-white/3" />
    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 dark:bg-white/3" />
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
        icon={<Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
        label="Total Habits"
        value={totalHabits}
        sub={totalHabits === 1 ? 'habit tracked' : 'habits tracked'}
        gradient="bg-white dark:bg-gray-900"
        iconBg="bg-violet-50 dark:bg-violet-900/30"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        label="This Week"
        value={`${weeklyRate}%`}
        sub={`${monthlyRate}% this month`}
        gradient="bg-white dark:bg-gray-900"
        iconBg="bg-indigo-50 dark:bg-indigo-900/30"
      />
      <StatCard
        icon={<Flame className="w-5 h-5 text-orange-500" />}
        label="Best Streak"
        value={`${longestStreak}d`}
        sub="longest ever"
        gradient="bg-white dark:bg-gray-900"
        iconBg="bg-orange-50 dark:bg-orange-900/30"
      />
      <StatCard
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        label="Total Check-ins"
        value={totalCheckIns.toLocaleString()}
        sub="all time"
        gradient="bg-white dark:bg-gray-900"
        iconBg="bg-emerald-50 dark:bg-emerald-900/30"
      />
    </div>
  );
};

export default OverviewCards;
