import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useHabits } from './hooks/useHabits';
import { ViewType } from './types/habit';
import Sidebar from './components/Layout/Sidebar';
import MobileNav from './components/Layout/MobileNav';
import TodayView from './components/Today/TodayView';
import CalendarView from './components/Calendar/CalendarView';
import HabitsView from './components/Habits/HabitsView';
import FitnessView from './components/Fitness/FitnessView';
import SettingsView from './components/Settings/SettingsView';
import PasscodeView from './components/Auth/PasscodeView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useWeight } from './hooks/useWeight';
import { useCalendar } from './hooks/useCalendar';

/**
 * Data hooks live here, INSIDE the auth gate.
 *
 * They only mount once a session exists, so their initial Supabase fetch always
 * runs WITH credentials. (Mounting them above the gate would fire the query
 * unauthenticated, get zero rows back from RLS, and leave the app empty.)
 */
const AuthenticatedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('today');

  const {
    habits,
    logs,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleLog,
    logAmount,
    isCompleted,
    getStreak,
    getCompletionRate,
    getOverallCompletionRate,
    getTotalCheckIns,
    getLongestActiveStreak,
    getHabitMiniTrend,
  } = useHabits();

  const { logWeight, getWeightLog, getWeightLogs } = useWeight();
  const calendar = useCalendar();

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        habitCount={habits.length}
      />
      <MobileNav currentView={currentView} onViewChange={setCurrentView} />

      {/* Main content */}
      <main className="md:ml-64 min-h-dvh">
        <div className="app-main">
          {currentView === 'today' && (
            <TodayView
              habits={habits}
              logs={logs}
              isCompleted={isCompleted}
              toggleLog={toggleLog}
              logAmount={logAmount}
              getStreak={getStreak}
              getOverallCompletionRate={getOverallCompletionRate}
              getTotalCheckIns={getTotalCheckIns}
              getLongestActiveStreak={getLongestActiveStreak}
            />
          )}
          {currentView === 'calendar' && <CalendarView calendar={calendar} />}
          {currentView === 'habits' && (
            <HabitsView
              habits={habits}
              onAdd={addHabit}
              onUpdate={updateHabit}
              onDelete={deleteHabit}
              getStreak={getStreak}
              getCompletionRate={getCompletionRate}
              getHabitMiniTrend={getHabitMiniTrend}
            />
          )}
          {currentView === 'fitness' && (
            <FitnessView
              getWeightLog={getWeightLog}
              logWeight={logWeight}
              getWeightLogs={getWeightLogs}
            />
          )}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isUnlocked, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-dvh bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isUnlocked) {
    return <PasscodeView />;
  }

  return <AuthenticatedApp />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
