import React from 'react';
import {
  Swords, ListChecks, BarChart3, Moon, Sun, Settings, Target, Dumbbell,
  CalendarDays, Trophy,
} from 'lucide-react';
import { ViewType } from '../../types/habit';
import { useTheme } from '../../contexts/ThemeContext';
import { GameStats } from '../../game/types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  habitCount: number;
  stats?: GameStats;
}

const navItems = [
  { id: 'today' as ViewType, label: 'Command', icon: Swords },
  { id: 'calendar' as ViewType, label: 'Calendar', icon: CalendarDays },
  { id: 'habits' as ViewType, label: 'Quests', icon: ListChecks },
  { id: 'goals' as ViewType, label: 'Campaigns', icon: Target },
  { id: 'fitness' as ViewType, label: 'Training', icon: Dumbbell },
  { id: 'analytics' as ViewType, label: 'Stats', icon: BarChart3 },
  { id: 'achievements' as ViewType, label: 'Trophies', icon: Trophy },
  { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, habitCount, stats }) => {
  const { isDark, toggleDark } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 fixed left-0 top-0 bottom-0 z-20">
      {/* Brand */}
      <div className="px-6 py-7 border-b border-zinc-200 dark:border-zinc-900/50">
        <h1 className="font-semibold text-zinc-900 dark:text-white text-xl tracking-tight leading-none uppercase">Streakly</h1>
        <p className="text-[9px] font-mono text-zinc-500 tracking-widest mt-2 uppercase">Operating System v2.0</p>
      </div>

      {/* Player card */}
      {stats && (
        <div className="px-4 pt-5">
          <div
            className="rounded-xl border p-3 relative overflow-hidden"
            style={{ borderColor: `${stats.rank.color}44`, backgroundColor: `${stats.rank.color}0f` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border"
                style={{ borderColor: `${stats.rank.color}66`, backgroundColor: `${stats.rank.color}1a` }}
              >
                <span className="text-sm font-bold tabular-nums" style={{ color: stats.rank.color }}>{stats.level}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Level {stats.level}</p>
                <p className="text-sm font-bold truncate" style={{ color: stats.rank.color }}>{stats.rank.name}</p>
              </div>
            </div>
            <div className="mt-2.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(3, (stats.xpIntoLevel / Math.max(1, stats.xpForNext)) * 100)}%`,
                  background: `linear-gradient(90deg, ${stats.rank.color}, #34d399)`,
                }}
              />
            </div>
            <p className="mt-1.5 text-[9px] uppercase tracking-widest text-zinc-500 tabular-nums">
              {stats.xpIntoLevel}/{stats.xpForNext} XP
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative ${
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-900 dark:text-white font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 font-light'
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-r-full" />}
              <Icon className={`w-4 h-4 stroke-[1.5] ${isActive ? 'text-emerald-500' : 'opacity-70'}`} />
              <span className="tracking-wide">{label}</span>
              {id === 'habits' && habitCount > 0 && (
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-md font-medium border tabular-nums ${
                  isActive
                    ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white'
                    : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}>
                  {habitCount}
                </span>
              )}
              {id === 'achievements' && stats && (
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-md font-medium border tabular-nums ${
                  isActive
                    ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white'
                    : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}>
                  {stats.achievements.filter(a => a.unlocked).length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme */}
      <div className="p-5 border-t border-zinc-200 dark:border-zinc-900/50">
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg border border-zinc-200 dark:border-zinc-800/50">
          <button
            onClick={() => isDark && toggleDark()}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              !isDark ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sun className="w-3.5 h-3.5 stroke-[2]" /> Light
          </button>
          <button
            onClick={() => !isDark && toggleDark()}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              isDark ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Moon className="w-3.5 h-3.5 stroke-[2]" /> Dark
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
