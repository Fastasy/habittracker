import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

/**
 * Streakly uses a single access code (passcode) instead of a login form.
 *
 * The app data lives in Supabase behind Row Level Security (auth.uid() = user_id),
 * so we still establish a real Supabase session — we just do it *silently* with a
 * dedicated app identity, using the code you type as the credential.
 *
 * Supabase persists the session locally (localStorage) and auto-refreshes it, so
 * you only ever type the code once per device.
 */

const APP_EMAIL =
  (import.meta.env.VITE_STREAKLY_EMAIL as string | undefined) || 'streakly@allegro.digital';

interface AuthContextType {
  /** True once a valid session exists (i.e. the code has been accepted). */
  isUnlocked: boolean;
  isLoading: boolean;
  /** Attempt to unlock with a typed access code. */
  unlock: (passcode: string) => Promise<{ ok: boolean; error?: string }>;
  /** Forget the session on this device and return to the lock screen. */
  lock: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isUnlocked: false,
  isLoading: true,
  unlock: async () => ({ ok: false }),
  lock: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore an existing (persisted) session on load — no code required.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const unlock = useCallback(async (passcode: string): Promise<{ ok: boolean; error?: string }> => {
    const code = passcode.trim();
    if (!code) return { ok: false, error: 'Enter your access code.' };

    const { error } = await supabase.auth.signInWithPassword({
      email: APP_EMAIL,
      password: code,
    });

    if (error) {
      // 400 = wrong credentials. Anything else is a connectivity/server problem.
      const isBadCode = error.status === 400 || /invalid/i.test(error.message);
      return {
        ok: false,
        error: isBadCode
          ? 'Incorrect access code.'
          : "Couldn't reach the server. Check your connection and try again.",
      };
    }

    return { ok: true };
  }, []);

  const lock = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ isUnlocked: !!session, isLoading, unlock, lock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
