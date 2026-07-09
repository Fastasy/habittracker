import React from 'react';
import { CheckCircle2, ListChecks, BarChart3, Moon, Sun, Sparkles, Settings, Target, Dumbbell } from 'lucide-react';
import { ViewType } from '../../types/habit';
import { useTheme } from '../../contexts/ThemeContext';

interface MobileNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems = [
  { id: 'today' as ViewType, label: 'Today', icon: CheckCircle2 },
  { id: 'habits' as ViewType, label: 'Habits', icon: ListChecks },
  { id: 'goals' as ViewType, label: 'Goals', icon: Target },
  { id: 'fitness' as ViewType, label: 'Fitness', icon: Dumbbell },
  { id: 'analytics' as ViewType, label: 'Stats', icon: BarChart3 },
  { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
];

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onViewChange }) => {
  const { isDark, toggleDark } = useTheme();

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white dark:bg-black border-b border-zinc-300 dark:border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-white">Streakly</span>
        </div>
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-black border-t border-zinc-300 dark:border-zinc-900 px-2 pb-safe">
        <div className="flex">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentView === id;
            return (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
