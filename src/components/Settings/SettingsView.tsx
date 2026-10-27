import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SettingsView: React.FC = () => {
  const { lock } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pt-2 md:pt-4 pb-2 md:pb-20">
      <div className="mb-2 md:mb-8 border-b border-zinc-200 dark:border-zinc-800/80 pb-4 md:pb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-500 tracking-wide mt-1">Theme and device session.</p>
      </div>

      {/* Session Section */}
      <section className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-red-200 dark:border-red-900/30 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-900/50">
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Lock This Device</h3>
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 mt-1 max-w-sm">
                Clears the saved session. You'll need your access code to get back in.
              </p>
            </div>
          </div>
          <button
            onClick={lock}
            className="min-h-[44px] px-4 flex-shrink-0 rounded-lg text-xs font-semibold bg-red-50 active:bg-red-100 text-red-600 dark:bg-red-900/20 dark:active:bg-red-900/40 dark:text-red-400 transition-all border border-red-200 dark:border-red-800/50"
          >
            Lock
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
