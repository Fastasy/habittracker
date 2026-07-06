import React from 'react';
import { CheckCircle2, ListChecks, BarChart3, Moon, Sun, Sparkles } from 'lucide-react';
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
  { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3 },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, habitCount }) => {
  const { isDark, toggleDark } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 bottom-0 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-none">Streakly</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Habit Tracker</p>
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
                  ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-violet-600 dark:text-violet-400' : ''}`} />
              {label}
              {id === 'habits' && habitCount > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {habitCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <p className="text-xs text-center text-gray-300 dark:text-gray-700 pb-1">Streakly v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
