import React from 'react';
import { CheckCircle2, ListChecks, BarChart3, Moon, Sun, Sparkles, Settings, Target, Dumbbell } from 'lucide-react';
import { ViewType } from '../../types/habit';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  habitCount: number;
}

const navItems = [
  { id: 'today' as ViewType, label: 'Today', icon: CheckCircle2 },
  { id: 'habits' as ViewType, label: 'My Habits', icon: ListChecks },
  { id: 'goals' as ViewType, label: 'My Goals', icon: Target },
  { id: 'fitness' as ViewType, label: 'Fitness', icon: Dumbbell },
  { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3 },
  { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, habitCount }) => {
  const { isDark, toggleDark } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-black border-r border-zinc-300 dark:border-zinc-900 fixed left-0 top-0 bottom-0 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 dark:text-white text-lg leading-none">Streakly</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Habit Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-600 dark:text-yellow-400' : ''}`} />
              {label}
              {id === 'habits' && habitCount > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {habitCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-1">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <p className="text-xs text-center text-zinc-300 dark:text-zinc-700 pb-1">Streakly v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
