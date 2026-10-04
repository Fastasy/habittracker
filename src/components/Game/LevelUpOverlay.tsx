import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Flame, Zap, CheckCircle2, Target, ListChecks, StickyNote, Dumbbell, Shield, Sparkles } from 'lucide-react';
import { Achievement, GameStats } from '../../game/types';
import { rankFor } from '../../game/xp';
import { TIER_STYLE } from '../../game/achievements';

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  zap: Zap, flame: Flame, check: CheckCircle2, target: Target,
  list: ListChecks, note: StickyNote, dumbbell: Dumbbell, shield: Shield, crown: Crown,
};

const LEVEL_KEY = 'streakly_seen_level';
const BADGE_KEY = 'streakly_seen_badges';

/**
 * Watches for a level-up or a freshly-unlocked badge and celebrates it.
 * "Seen" markers live in localStorage only — they record what has already been
 * announced, never any game progress (which is always derived from real data).
 */
const LevelUpOverlay: React.FC<{ stats: GameStats }> = ({ stats }) => {
  const [levelUp, setLevelUp] = useState<{ from: number; to: number } | null>(null);
  const [fresh, setFresh] = useState<Achievement[]>([]);
  const unlockedKey = stats.achievements.filter(a => a.unlocked).map(a => a.id).join(',');
  const firstRun = useRef(true);

  useEffect(() => {
    // ---- level ----
    const seenRaw = localStorage.getItem(LEVEL_KEY);
    if (seenRaw === null) {
      localStorage.setItem(LEVEL_KEY, String(stats.level));
    } else if (stats.level > Number(seenRaw)) {
      setLevelUp({ from: Number(seenRaw), to: stats.level });
      localStorage.setItem(LEVEL_KEY, String(stats.level));
    }

    // ---- badges ----
    const raw = localStorage.getItem(BADGE_KEY);
    const unlockedIds = unlockedKey ? unlockedKey.split(',') : [];
    if (raw === null) {
      // Baseline on first sighting so a returning player isn't buried in
      // toasts for badges they earned long ago.
      localStorage.setItem(BADGE_KEY, JSON.stringify(unlockedIds));
    } else {
      let seen: string[] = [];
      try { seen = JSON.parse(raw); } catch { seen = []; }
      const newIds = unlockedIds.filter(id => !seen.includes(id));
      if (newIds.length) {
        setFresh(stats.achievements.filter(a => newIds.includes(a.id)));
        localStorage.setItem(BADGE_KEY, JSON.stringify(unlockedIds));
      }
    }
    firstRun.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.level, unlockedKey]);

  // auto-dismiss
  useEffect(() => {
    if (!levelUp) return;
    const t = setTimeout(() => setLevelUp(null), 4200);
    return () => clearTimeout(t);
  }, [levelUp]);

  useEffect(() => {
    if (fresh.length === 0) return;
    const t = setTimeout(() => setFresh([]), 6000);
    return () => clearTimeout(t);
  }, [fresh]);

  const rank = levelUp ? rankFor(levelUp.to) : null;

  return (
    <>
      {/* Level up */}
      <AnimatePresence>
        {levelUp && rank && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLevelUp(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative w-full max-w-md rounded-3xl border bg-zinc-950 p-8 text-center overflow-hidden"
              style={{ borderColor: `${rank.color}66`, boxShadow: `0 0 60px -10px ${rank.color}88` }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(70% 60% at 50% 0%, ${rank.color}, transparent 70%)` }}
              />
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                  className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${rank.color}22`, border: `1px solid ${rank.color}66` }}
                >
                  <Sparkles className="w-8 h-8" style={{ color: rank.color }} />
                </motion.div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">Level Up</p>
                <h2 className="mt-2 text-5xl font-bold text-white tabular-nums">{levelUp.to}</h2>
                <p className="mt-3 text-sm font-semibold uppercase tracking-widest" style={{ color: rank.color }}>
                  {rank.name}
                </p>
                <p className="mt-4 text-sm text-zinc-400">
                  {levelUp.to - levelUp.from === 1
                    ? 'You gained a level.'
                    : `You gained ${levelUp.to - levelUp.from} levels.`}{' '}
                  Keep the combo alive.
                </p>
                <p className="mt-6 text-[10px] uppercase tracking-widest text-zinc-600">Tap to dismiss</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fresh badges */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {fresh.map(a => {
            const t = TIER_STYLE[a.tier];
            const Icon = ICONS[a.tier === 'legend' ? 'crown' : a.tier === 'gold' ? 'shield' : 'zap'] ?? Zap;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                className="pointer-events-auto flex items-center gap-3 rounded-xl border bg-zinc-950/95 backdrop-blur px-4 py-3 shadow-xl"
                style={{ borderColor: `${t.ring}88` }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${t.text}1a` }}>
                  <Icon className="w-4 h-4" style={{ color: t.text }} />
                </div>
                <div className="leading-tight">
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: t.text }}>
                    {t.label} unlocked
                  </p>
                  <p className="text-sm font-semibold text-white">{a.name}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

export default LevelUpOverlay;
export { ICONS as ACHIEVEMENT_ICONS };
