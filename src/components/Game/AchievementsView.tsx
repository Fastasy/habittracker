import React, { useMemo, useState } from 'react';
import { Lock, Trophy } from 'lucide-react';
import { GameStats, AchievementTier } from '../../game/types';
import { TIER_STYLE } from '../../game/achievements';
import { ACHIEVEMENT_ICONS } from './LevelUpOverlay';

interface AchievementsViewProps {
  stats: GameStats;
}

const TIER_ORDER: AchievementTier[] = ['legend', 'gold', 'silver', 'bronze'];
const FILTERS: { id: string; label: string; match: (t: AchievementTier) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'unlocked', label: 'Unlocked', match: () => true },
  { id: 'legend', label: 'Legend', match: t => t === 'legend' },
  { id: 'gold', label: 'Gold', match: t => t === 'gold' },
  { id: 'silver', label: 'Silver', match: t => t === 'silver' },
  { id: 'bronze', label: 'Bronze', match: t => t === 'bronze' },
];

const AchievementsView: React.FC<AchievementsViewProps> = ({ stats }) => {
  const [filter, setFilter] = useState('all');

  const unlocked = stats.achievements.filter(a => a.unlocked).length;
  const total = stats.achievements.length;

  const list = useMemo(() => {
    let items = stats.achievements;
    if (filter === 'unlocked') items = items.filter(a => a.unlocked);
    else if (filter !== 'all') items = items.filter(a => a.tier === filter);

    // Unlocked first, then closest to completion.
    return [...items].sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      const ra = a.progress / a.target;
      const rb = b.progress / b.target;
      return rb - ra;
    });
  }, [stats.achievements, filter]);

  const byTier = TIER_ORDER.map(tier => ({
    tier,
    unlocked: stats.achievements.filter(a => a.tier === tier && a.unlocked).length,
    total: stats.achievements.filter(a => a.tier === tier).length,
  }));

  return (
    <div className="space-y-6 pt-2 pb-20">
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Trophy Room</h2>
            <p className="text-sm text-zinc-500 tracking-wide mt-1">
              {unlocked} of {total} unlocked · every badge is earned from real history
            </p>
          </div>
        </div>
      </div>

      {/* Tier summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {byTier.map(({ tier, unlocked: u, total: t }) => {
          const s = TIER_STYLE[tier];
          return (
            <div
              key={tier}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: s.text }}>
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {u}<span className="text-sm text-zinc-500">/{t}</span>
              </p>
              <div className="mt-2 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${t ? (u / t) * 100 : 0}%`, backgroundColor: s.text }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === f.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                : 'bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(a => {
          const s = TIER_STYLE[a.tier];
          const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Trophy;
          const pct = Math.min(100, (a.progress / a.target) * 100);
          return (
            <div
              key={a.id}
              className={`rounded-xl border p-4 transition-all ${
                a.unlocked
                  ? 'border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60'
                  : 'border-dashed border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20'
              }`}
              style={a.unlocked ? { boxShadow: `inset 3px 0 0 ${s.text}` } : undefined}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    a.unlocked ? '' : 'opacity-40'
                  }`}
                  style={{
                    backgroundColor: a.unlocked ? `${s.text}1a` : 'transparent',
                    borderColor: a.unlocked ? `${s.text}55` : 'rgba(113,113,122,0.3)',
                  }}
                >
                  {a.unlocked ? (
                    <Icon className="w-5 h-5" style={{ color: s.text }} />
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold truncate ${a.unlocked ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                      {a.name}
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: s.text }}>
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{a.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s.text }} />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-500 tabular-nums whitespace-nowrap">
                      {a.progress}/{a.target}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsView;
