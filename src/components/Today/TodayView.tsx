import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, LayoutList, CheckCircle2, Target, Coffee, Zap,
  AlertCircle, Copy, TrendingUp, AlertTriangle, Swords, Flame, Trophy, Lock,
} from 'lucide-react';
import { format, subDays, addDays, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../../types/habit';
import { useHabits } from '../../hooks/useHabits';
import { useSettings } from '../../hooks/useSettings';
import { useMomentum } from '../../hooks/useMomentum';
import { toDateString, isHabitScheduledForDate, getLastNDays } from '../../utils/dateUtils';
import HabitCheckItem from './HabitCheckItem';
import { emojiToIcon } from '../../utils/iconMap';
import MomentumChart from './MomentumChart';
import InfoTooltip from '../InfoTooltip';
import { GameStats } from '../../game/types';
import { completionXp } from '../../game/xp';
import { TIER_STYLE } from '../../game/achievements';
import { ACHIEVEMENT_ICONS } from '../Game/LevelUpOverlay';

interface TodayViewProps {
  habits: Habit[];
  logs: ReturnType<typeof useHabits>['logs'];
  isCompleted: ReturnType<typeof useHabits>['isCompleted'];
  toggleLog: ReturnType<typeof useHabits>['toggleLog'];
  logAmount: ReturnType<typeof useHabits>['logAmount'];
  getStreak: ReturnType<typeof useHabits>['getStreak'];
  stats: GameStats;
}

const card = 'bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm';

/** The Command Center — today's quest board and the run you're on. */
const TodayView: React.FC<TodayViewProps> = ({ habits, logs, isCompleted, toggleLog, logAmount, getStreak, stats }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { pillars, valueConfig, disciplineConfig, exportConfig } = useSettings();
  const momentumData = useMomentum();

  const dateStr = toDateString(selectedDate);
  const isTodaySelected = isToday(selectedDate);

  const goBack = () => setSelectedDate(prev => subDays(prev, 1));
  const goForward = () => { if (!isTodaySelected) setSelectedDate(prev => addDays(prev, 1)); };

  const recentDays = useMemo(() => Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i)), []);

  const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, dateStr));
  const completedHabits = scheduledHabits.filter(h => isCompleted(h.id, dateStr));
  const pendingHabits = scheduledHabits.filter(h => !isCompleted(h.id, dateStr));
  const completedCount = completedHabits.length;
  const totalCount = scheduledHabits.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const dayLabel = isTodaySelected ? 'Today' : format(selectedDate, 'EEEE');
  const dateLabel = format(selectedDate, 'MMMM d, yyyy');

  /** XP a quest banks at its current combo. */
  const xpFor = (habit: Habit, done: boolean) => {
    const streak = getStreak(habit.id).current;
    return completionXp(Math.max(1, done ? streak - 1 : streak));
  };

  const boardXp = useMemo(
    () => completedHabits.reduce((sum, h) => sum + xpFor(h, true), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completedHabits, habits]
  );

  const totalValueAccumulated = useMemo(
    () => completedHabits.reduce((sum, h) => sum + (h.value || 0), 0),
    [completedHabits]
  );

  const pillarStats = useMemo(() => pillars.map(p => {
    const pHabits = scheduledHabits.filter(h => h.pillarId === p.id);
    const pCompleted = completedHabits.filter(h => h.pillarId === p.id);
    return { ...p, total: pHabits.length, completed: pCompleted.length, progress: pHabits.length ? (pCompleted.length / pHabits.length) * 100 : 0 };
  }).filter(p => p.total > 0), [pillars, scheduledHabits, completedHabits]);

  const disciplineInfo = useMemo(() => {
    const last14 = getLastNDays(14);
    let scheduled = 0, completed = 0;
    for (const day of last14) {
      const sch = habits.filter(h => isHabitScheduledForDate(h, day));
      scheduled += sch.length;
      completed += sch.filter(h => isCompleted(h.id, day)).length;
    }
    const rate = scheduled > 0 ? (completed / scheduled) * 100 : 100;
    return { rate, isFailing: rate < disciplineConfig.threshold };
  }, [habits, isCompleted, disciplineConfig]);

  const handleExport = () => {
    let tpl = exportConfig.template;
    tpl = tpl.replace(/\{\{date\}\}/g, dateLabel);
    tpl = tpl.replace(/\{\{discipline_status\}\}/g, `${disciplineInfo.rate.toFixed(1)}%`);
    tpl = tpl.replace(/\{\{completed_habits\}\}/g, completedCount.toString());
    tpl = tpl.replace(/\{\{missed_habits\}\}/g, pendingHabits.length.toString());
    tpl = tpl.replace(/\{\{value_accumulated\}\}/g, `${totalValueAccumulated} ${valueConfig.symbol}`);

    let pStatsStr = '';
    for (const p of pillarStats) pStatsStr += `\n- ${p.icon} ${p.name}: ${p.completed}/${p.total} (${p.progress.toFixed(0)}%)`;
    tpl = tpl.replace(/\{\{pillar_stats\}\}/g, pStatsStr.trim() || 'No pillars active');

    navigator.clipboard.writeText(tpl).then(() => alert('Daily log copied to clipboard!'));
  };

  // Closest badges to unlocking
  const nextBadges = useMemo(
    () => stats.achievements
      .filter(a => !a.unlocked)
      .sort((a, b) => (b.progress / b.target) - (a.progress / a.target))
      .slice(0, 3),
    [stats.achievements]
  );

  const comboMult = (1 + Math.min(Math.max(stats.bestCombo - 1, 0), 10) * 0.1).toFixed(1);
  const ringPct = totalCount > 0 ? completedCount / totalCount : 0;
  const R = 52, STROKE = 8, C = 2 * Math.PI * R;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto pt-4 pb-20 space-y-6">

      {/* ---- Header ---- */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">{dayLabel}</h2>
            {isTodaySelected && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest rounded-md">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 tracking-wide">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="mr-2 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex items-center gap-2 text-xs font-semibold tracking-wide">
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={goBack} className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all active:scale-95">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goForward} disabled={isTodaySelected} className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ---- Date pills ---- */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {recentDays.map((day, i) => {
          const ds = toDateString(day);
          const isSelected = ds === dateStr;
          const isT = isToday(day);
          const dayHabits = habits.filter(h => isHabitScheduledForDate(h, ds));
          const dayDone = dayHabits.filter(h => isCompleted(h.id, ds)).length;
          const dayComplete = dayHabits.length > 0 && dayDone === dayHabits.length;
          return (
            <motion.button key={ds} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }}
              onClick={() => setSelectedDate(day)}
              className={`snap-start relative flex flex-col items-center gap-1.5 px-3.5 py-2.5 rounded-xl flex-shrink-0 transition-all duration-200 min-w-[56px] border ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-md'
                  : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{format(day, 'EEE')}</span>
              <span className={`text-lg font-semibold ${isSelected ? '' : 'text-zinc-900 dark:text-zinc-300'}`}>{format(day, 'd')}</span>
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                dayComplete ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : isSelected ? 'bg-zinc-500 dark:bg-zinc-400' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
              {isT && !isSelected && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />}
            </motion.button>
          );
        })}
      </div>

      {/* `grid-cols-1` (= minmax(0,1fr)) matters: with no base column the mobile
          track is `auto`, which sizes to max-content and forces the page wider
          than the viewport. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] items-start">
        {/* ================= LEFT ================= */}
        <div className="space-y-6">
          {/* ---- QUEST BOARD HERO ---- */}
          <div className={`${card} relative overflow-hidden p-6`}>
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{ background: `radial-gradient(90% 120% at 100% 0%, ${allDone ? '#34d399' : '#a78bfa'}, transparent 65%)` }} />
            <div className="relative flex items-center gap-6 flex-wrap">
              <div className="relative flex-shrink-0" style={{ width: 128, height: 128 }}>
                <svg width={128} height={128} className="-rotate-90">
                  <circle cx={64} cy={64} r={R} fill="none" stroke="rgba(113,113,122,0.25)" strokeWidth={STROKE} />
                  <circle cx={64} cy={64} r={R} fill="none" stroke={allDone ? '#34d399' : '#a78bfa'} strokeWidth={STROKE}
                    strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - ringPct)}
                    style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.4,0,0.2,1)' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white tabular-nums leading-none">{completedCount}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">of {totalCount}</span>
                </div>
              </div>

              <div className="flex-1 min-w-[180px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  {isTodaySelected ? "Today's Board" : `${format(selectedDate, 'EEEE')}'s Board`}
                </p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {totalCount === 0 ? 'Nothing scheduled'
                    : allDone ? 'Board cleared 🎉'
                    : `${totalCount - completedCount} quest${totalCount - completedCount === 1 ? '' : 's'} remaining`}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <Swords className="w-3.5 h-3.5" /> +{boardXp} XP banked
                  </span>
                  {stats.bestCombo >= 2 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                      <Flame className="w-3.5 h-3.5" /> ×{comboMult} combo
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                    <Trophy className="w-3.5 h-3.5" /> {stats.totalXp} XP total
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Discipline alert ---- */}
          <AnimatePresence mode="popLayout">
            {disciplineInfo.isFailing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                  <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Discipline Threshold Breached</h4>
                      <InfoTooltip text="Triggered when your 14-day completion rate falls below your configured discipline threshold." />
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-300/80 mt-1">{disciplineConfig.message}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1 flex-1 bg-red-200 dark:bg-red-900/40 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${disciplineInfo.rate}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-400">{disciplineInfo.rate.toFixed(0)}% / {disciplineConfig.threshold}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- Quests ---- */}
          <div className="space-y-3 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Daily Quests</h3>
              {totalCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {completedCount}/{totalCount} cleared
                </span>
              )}
            </div>

            {scheduledHabits.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-14 px-6 border border-dashed border-zinc-300 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                {habits.length === 0 ? (
                  <>
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-5 text-zinc-400">
                      <LayoutList className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">No quests yet</h3>
                    <p className="text-xs text-zinc-500 tracking-wide max-w-sm mx-auto">Head to Quests to build your first routine. Every completion banks XP.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-5 text-zinc-400">
                      <Coffee className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2 tracking-tight">Rest Day</h3>
                    <p className="text-xs text-zinc-500 tracking-wide max-w-sm mx-auto">No quests scheduled for {format(selectedDate, 'EEEE')}. Recovery counts too.</p>
                  </>
                )}
              </motion.div>
            ) : (
              <AnimatePresence>
                {pendingHabits.map((habit, i) => (
                  <motion.div key={habit.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
                    <HabitCheckItem
                      habit={habit}
                      completed={false}
                      onToggle={() => toggleLog(habit.id, dateStr)}
                      currentAmount={logs.find(l => l.habitId === habit.id && l.date === dateStr)?.amount}
                      onLogAmount={(amount) => logAmount(habit.id, dateStr, amount)}
                      xp={xpFor(habit, false)}
                      combo={getStreak(habit.id).current}
                    />
                  </motion.div>
                ))}

                {pendingHabits.length > 0 && completedHabits.length > 0 && (
                  <motion.div layout className="flex items-center gap-4 py-3 opacity-50">
                    <div className="flex-1 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cleared
                    </span>
                    <div className="flex-1 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                  </motion.div>
                )}

                {completedHabits.map((habit) => (
                  <motion.div key={habit.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <HabitCheckItem
                      habit={habit}
                      completed={true}
                      onToggle={() => toggleLog(habit.id, dateStr)}
                      currentAmount={logs.find(l => l.habitId === habit.id && l.date === dateStr)?.amount}
                      onLogAmount={(amount) => logAmount(habit.id, dateStr, amount)}
                      xp={xpFor(habit, true)}
                      combo={getStreak(habit.id).current}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-6">
          {/* Progress card */}
          {totalCount > 0 && (
            <div className={`${card} p-5`}>
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${allDone ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                    {allDone ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Board Progress</p>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {completedCount} <span className="text-zinc-400">/ {totalCount}</span>
                    </span>
                  </div>
                </div>
                <span className={`text-2xl font-semibold tracking-tight ${allDone ? 'text-emerald-500' : 'text-zinc-900 dark:text-white'}`}>
                  {Math.round(progressPct)}<span className="text-sm font-normal text-zinc-500">%</span>
                </span>
              </div>
              <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${allDone ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-900 dark:bg-zinc-100'}`} />
              </div>
            </div>
          )}

          {/* Momentum */}
          <div className={`${card} p-5 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-20 h-20 text-emerald-500" /></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Momentum</h3>
                <InfoTooltip text="Your total active momentum score. Compounds at 5% daily on active streaks, but suffers a full reset if you miss a day." />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight tabular-nums">{momentumData.currentScore}</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">pts</span>
              </div>
              <div className="flex items-start gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                {momentumData.droppedRecently ? (
                  <>
                    <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-500/20 mt-0.5"><AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-500" /></div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      <span className="text-rose-600 dark:text-rose-400">Drag detected.</span> Starting over costs 10× more than staying consistent.
                    </p>
                  </>
                ) : momentumData.currentScore > momentumData.baseSum ? (
                  <>
                    <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 mt-0.5"><TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /></div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      <span className="text-emerald-600 dark:text-emerald-400">Compounding.</span> Your effort is growing at +5% daily.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 mt-0.5"><Target className="w-4 h-4 text-zinc-500" /></div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      Building the base. Hold a streak to switch on compounding.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={`${card} p-4`}>
            <MomentumChart data={momentumData.history} />
          </div>

          {/* Next badges */}
          {nextBadges.length > 0 && (
            <div className={`${card} p-5`}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Next Unlocks</h3>
              <ul className="space-y-3">
                {nextBadges.map(a => {
                  const t = TIER_STYLE[a.tier];
                  const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Lock;
                  const pct = Math.min(100, (a.progress / a.target) * 100);
                  return (
                    <li key={a.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                        style={{ backgroundColor: `${t.text}14`, borderColor: `${t.text}44` }}>
                        <Icon className="w-4 h-4" style={{ color: t.text }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{a.name}</p>
                          <span className="text-[10px] text-zinc-500 tabular-nums flex-shrink-0">{a.progress}/{a.target}</span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.text }} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Value tracker */}
          {valueConfig.active && (
            <div className={`${card} p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Value Today</p>
                    <InfoTooltip text="The total accrued value of all habits completed today." />
                  </div>
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {totalValueAccumulated} <span className="text-sm text-zinc-400 font-medium">{valueConfig.symbol}</span>
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-end mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weekly Target</p>
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                  ~{valueConfig.target ? Math.round((totalValueAccumulated / valueConfig.target) * 100) : 0}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${valueConfig.target ? Math.min(100, (totalValueAccumulated / valueConfig.target) * 100) : 0}%` }} />
              </div>
            </div>
          )}

          {/* Pillars */}
          {pillarStats.length > 0 && (
            <div className={`${card} p-5`}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Domains</h3>
              <div className="space-y-3">
                {pillarStats.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700"
                      style={{ backgroundColor: p.color + '15', color: p.color }}>
                      {emojiToIcon(p.icon, 'w-4 h-4')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate">{p.name}</p>
                        <span className="text-[9px] text-zinc-500 tabular-nums">{p.completed}/{p.total}</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TodayView;
