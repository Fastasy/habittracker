import React from 'react';
import { CheckCircle2, ListChecks, BarChart3, Moon, Sun, Settings, Target, Dumbbell } from 'lucide-react';
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
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900 dark:text-white uppercase tracking-tight text-lg">Streakly</span>
        </div>
        <button
          onClick={toggleDark}
          className="p-2 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 stroke-[1.5]" /> : <Moon className="w-5 h-5 stroke-[1.5]" />}
        </button>
      </header>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-zinc-50/80 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-900/50 px-2 pb-safe">
        <div className="flex">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentView === id;
            return (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-500'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <Icon className={`w-5 h-5 stroke-[1.5] ${isActive ? '' : 'opacity-70'}`} />
                <span className="tracking-wide uppercase">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
