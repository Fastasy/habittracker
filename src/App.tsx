import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useHabits } from './hooks/useHabits';
import { ViewType } from './types/habit';
import Sidebar from './components/Layout/Sidebar';
import MobileNav from './components/Layout/MobileNav';
import TodayView from './components/Today/TodayView';
import HabitsView from './components/Habits/HabitsView';
import AnalyticsView from './components/Analytics/AnalyticsView';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('today');

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
  } = useHabits();

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
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
