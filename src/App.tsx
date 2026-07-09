import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useHabits } from './hooks/useHabits';
import { ViewType } from './types/habit';
import Sidebar from './components/Layout/Sidebar';
import MobileNav from './components/Layout/MobileNav';
import TodayView from './components/Today/TodayView';
import HabitsView from './components/Habits/HabitsView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import SettingsView from './components/Settings/SettingsView';
import GoalsView from './components/Goals/GoalsView';
import FitnessView from './components/Fitness/FitnessView';
import AuthView from './components/Auth/AuthView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useGoals } from './hooks/useGoals';
import { useWeight } from './hooks/useWeight';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const { session, isLoading: isAuthLoading } = useAuth();

  const {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleLog,
    isCompleted,
    getStreak,
    getCompletionRate,
    getOverallCompletionRate,
    getTotalCheckIns,
    getWeeklyCompletionData,
    getWeekdayStats,
    getHeatmapData,
    getLongestActiveStreak,
    getHabitMiniTrend,
    setHabitGoal,
  } = useHabits();

  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const { logWeight, getWeightLog, getWeightLogs, logs: weightLogs } = useWeight();

  // Compute latest weight for GoalsView
  const latestWeight = React.useMemo(() => {
    if (weightLogs.length === 0) return undefined;
    const sorted = [...weightLogs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0].weight;
  }, [weightLogs]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        habitCount={habits.length}
      />
      <MobileNav currentView={currentView} onViewChange={setCurrentView} />

      {/* Main content */}
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 pt-16 md:pt-0 pb-24 md:pb-0 md:p-8">
          {currentView === 'today' && (
            <TodayView
              habits={habits}
              isCompleted={isCompleted}
              toggleLog={toggleLog}
              getStreak={getStreak}
            />
          )}
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
          {currentView === 'goals' && (
            <GoalsView
              goals={goals}
              habits={habits}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
              setHabitGoal={setHabitGoal}
              getCompletionRate={getCompletionRate}
              latestWeight={latestWeight}
            />
          )}
          {currentView === 'fitness' && (
            <FitnessView
              getWeightLog={getWeightLog}
              logWeight={logWeight}
              getWeightLogs={getWeightLogs}
            />
          )}
          {currentView === 'analytics' && (
            <AnalyticsView
              habits={habits}
              getStreak={getStreak}
              getCompletionRate={getCompletionRate}
              getOverallCompletionRate={getOverallCompletionRate}
              getTotalCheckIns={getTotalCheckIns}
              getWeeklyCompletionData={getWeeklyCompletionData}
              getWeekdayStats={getWeekdayStats}
              getHeatmapData={getHeatmapData}
              getLongestActiveStreak={getLongestActiveStreak}
              getHabitMiniTrend={getHabitMiniTrend}
            />
          )}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
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
