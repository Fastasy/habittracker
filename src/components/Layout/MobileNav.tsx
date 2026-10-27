import React, { useEffect, useState } from 'react';
import {
  Swords, ListChecks, Moon, Sun, Settings, Dumbbell, CalendarDays,
  X, MoreHorizontal,
} from 'lucide-react';
import { ViewType } from '../../types/habit';
import { useTheme } from '../../contexts/ThemeContext';

interface MobileNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

/**
 * Four tabs is the most that stays legible — and tappable — at 360px.
 * Settings lives in the "More" sheet.
 */
const primaryTabs = [
  { id: 'today' as ViewType, label: 'Today', icon: Swords },
  { id: 'calendar' as ViewType, label: 'Calendar', icon: CalendarDays },
  { id: 'habits' as ViewType, label: 'Habits', icon: ListChecks },
  { id: 'fitness' as ViewType, label: 'Training', icon: Dumbbell },
];

const moreNavItems: { id: ViewType; label: string; hint: string; icon: typeof Settings }[] = [
  { id: 'settings', label: 'Settings', hint: 'Lock & theme', icon: Settings },
];

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onViewChange }) => {
  const { isDark, toggleDark } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const inMoreSection = moreNavItems.some(i => i.id === currentView);

  // Close the sheet on Escape, and whenever the view changes underneath it.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSheetOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const pick = (id: ViewType) => {
    onViewChange(id);
    setSheetOpen(false);
  };

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden safe-top-bar fixed top-0 left-0 right-0 z-30 bg-zinc-50/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900/50 px-4 pb-2.5 flex items-center justify-between gap-2">
        <span className="font-semibold text-zinc-900 dark:text-white uppercase tracking-tight text-base">Streakly</span>
        <button
          onClick={toggleDark}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          className="w-11 h-11 -mr-1 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 active:bg-zinc-200/60 dark:active:bg-zinc-800 transition-colors flex-shrink-0"
        >
          {isDark ? <Sun className="w-5 h-5 stroke-[1.5]" /> : <Moon className="w-5 h-5 stroke-[1.5]" />}
        </button>
      </header>

      {/* More sheet */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute left-0 right-0 bottom-0 animate-sheet-up rounded-t-3xl border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">More</h2>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Close menu"
                className="w-11 h-11 -mr-2 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 active:bg-zinc-200/60 dark:active:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pb-2 grid grid-cols-2 gap-2.5">
              {moreNavItems.map(({ id, label, hint, icon: Icon }) => {
                const isActive = currentView === id;
                return (
                  <button
                    key={id}
                    onClick={() => pick(id)}
                    className={`min-h-[76px] flex flex-col items-start justify-center gap-1.5 rounded-2xl border p-3.5 text-left transition-colors ${
                      isActive
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 active:bg-zinc-100 dark:active:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon className={`w-5 h-5 stroke-[1.5] ${isActive ? 'text-emerald-500' : 'text-zinc-500'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{label}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-4 pb-3 pt-1">
              <button
                onClick={toggleDark}
                className="w-full min-h-[52px] flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-4 active:bg-zinc-100 dark:active:bg-zinc-800/60 transition-colors"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {isDark ? <Moon className="w-5 h-5 text-zinc-500" /> : <Sun className="w-5 h-5 text-zinc-500" />}
                  {isDark ? 'Dark theme' : 'Light theme'}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Tap to switch</span>
              </button>
            </div>

            <div className="h-2 safe-bottom-sheet" />
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="md:hidden safe-bottom-sheet fixed bottom-0 left-0 right-0 z-30 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-900/50 px-1.5 pt-1.5">
        <div className="flex items-stretch">
          {primaryTabs.map(({ id, label, icon: Icon }) => {
            const isActive = currentView === id;
            return (
              <button
                key={id}
                onClick={() => pick(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 min-w-0 min-h-[58px] flex flex-col items-center justify-center gap-1 rounded-xl px-0.5 transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <span className={`h-[3px] w-6 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-transparent'}`} />
                <Icon className={`w-[22px] h-[22px] stroke-[1.5] ${isActive ? '' : 'opacity-80'}`} />
                <span className="text-[11px] font-medium tracking-wide">{label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setSheetOpen(true)}
            aria-current={inMoreSection ? 'page' : undefined}
            aria-expanded={sheetOpen}
            className={`flex-1 min-w-0 min-h-[58px] flex flex-col items-center justify-center gap-1 rounded-xl px-0.5 transition-colors ${
              inMoreSection || sheetOpen ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <span className={`h-[3px] w-6 rounded-full transition-colors ${inMoreSection || sheetOpen ? 'bg-emerald-500' : 'bg-transparent'}`} />
            <MoreHorizontal className="w-[22px] h-[22px] stroke-[1.5]" />
            <span className="text-[11px] font-medium tracking-wide">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
