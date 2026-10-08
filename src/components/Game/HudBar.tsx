import React from 'react';
import { Flame, Zap, ChevronRight, Swords } from 'lucide-react';
import { GameStats } from '../../game/types';
import { nextRank } from '../../game/xp';

interface HudBarProps {
  stats: GameStats;
  onOpenAchievements?: () => void;
}

const Ring: React.FC<{
  value: number; size?: number; stroke?: number; color: string; track: string; children?: React.ReactNode;
}> = ({ value, size = 56, stroke = 5, color, track, children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
};

/**
 * The persistent HUD. Sits above every view so your level, progress and combo
 * are always in view while you play.
 *
 * Layout is two different arrangements of the same numbers: on desktop the
 * chips sit inline to the right of the XP bar; on a phone the HUD collapses to
 * a level line plus one swipeable chip row, so it costs ~130px of the viewport
 * instead of ~260px. No stat is dropped.
 */
const HudBar: React.FC<HudBarProps> = ({ stats, onOpenAchievements }) => {
  const pct = stats.xpForNext > 0 ? stats.xpIntoLevel / stats.xpForNext : 0;
  const next = nextRank(stats.level);
  const unlocked = stats.achievements.filter(a => a.unlocked).length;
  const comboMult = (1 + Math.min(Math.max(stats.bestCombo - 1, 0), 10) * 0.1).toFixed(1);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm">
      {/* accent wash */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ background: `radial-gradient(120% 140% at 0% 0%, ${stats.rank.color}, transparent 60%)` }}
      />

      <div className="relative p-3.5 md:p-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-6 md:flex-wrap">
        <div className="flex items-center gap-3.5 md:gap-4 md:flex-1 md:min-w-[260px]">
          {/* Level ring */}
          <Ring value={pct} color={stats.rank.color} track="rgba(113,113,122,0.25)">
            <div className="text-center leading-none">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">LVL</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">{stats.level}</div>
            </div>
          </Ring>

          {/* Rank + XP bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-[11px] md:text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md border truncate"
                style={{ color: stats.rank.color, borderColor: `${stats.rank.color}55`, backgroundColor: `${stats.rank.color}14` }}
              >
                {stats.rank.name}
              </span>
              {next && (
                <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-zinc-500 truncate">
                  {next.levelsAway} to {next.name}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, pct * 100)}%`,
                    background: `linear-gradient(90deg, ${stats.rank.color}, #34d399)`,
                    transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold text-zinc-500 tabular-nums whitespace-nowrap">
                {stats.xpIntoLevel} / {stats.xpForNext} XP
              </span>
            </div>
          </div>
        </div>

        {/* Stat chips — one swipeable row on mobile, inline on desktop */}
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide -mx-3.5 px-3.5 md:mx-0 md:px-0 md:overflow-visible md:flex-wrap">
          <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-2 md:py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Total</div>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">{stats.totalXp}</div>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-2 md:py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Swords className="w-3.5 h-3.5 text-emerald-500" />
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Today</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{stats.todayXp}
              </div>
            </div>
          </div>

          <div
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-2 md:py-1.5 rounded-lg border ${
              stats.bestCombo >= 3
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60'
            }`}
            title="Your longest active streak — every extra day raises the combo"
          >
            <Flame className={`w-3.5 h-3.5 ${stats.bestCombo >= 3 ? 'text-orange-500' : 'text-zinc-400'}`} />
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Combo</div>
              <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">×{comboMult}</div>
            </div>
          </div>

          {onOpenAchievements && (
            <button
              onClick={onOpenAchievements}
              className="flex-shrink-0 min-h-[44px] flex items-center gap-1.5 px-3 py-2 md:py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 active:bg-zinc-200 dark:active:bg-zinc-700/60 md:hover:border-zinc-300 md:dark:hover:border-zinc-600 transition-colors"
              title="View achievements"
            >
              <div className="leading-none text-left">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Badges</div>
                <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">
                  {unlocked}/{stats.achievements.length}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HudBar;
