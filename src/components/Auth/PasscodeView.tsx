import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Command, KeyRound, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PasscodeView: React.FC = () => {
  const { unlock } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const result = await unlock(code);

    if (!result.ok) {
      setError(result.error || 'Incorrect access code.');
      setIsLoading(false);
      setCode('');
      inputRef.current?.focus();
      return;
    }
    // Success: the provider flips isUnlocked and renders the app.
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      <div className="w-full max-w-[380px]">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center mb-6 shadow-md border border-zinc-200 dark:border-zinc-800">
            <Command className="w-6 h-6 text-white dark:text-zinc-900" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">
            Streakly
          </h1>
          <p className="text-sm text-zinc-500 tracking-wide text-center">
            Executive performance tracking.
          </p>
        </div>

        {/* Passcode Card */}
        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center justify-center gap-2 mb-6">
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Enter Access Code
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium p-3 rounded-lg mb-6 border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  ref={inputRef}
                  type="password"
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="current-password"
                  spellCheck={false}
                  autoCapitalize="none"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 tracking-widest"
                  placeholder="••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.trim().length === 0}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-white dark:focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Unlock
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed text-zinc-500 text-center">
              You'll stay unlocked on this device. You only enter the code again after
              clearing your browser data or locking the session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasscodeView;
