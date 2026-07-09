import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data?.user && data?.session === null) {
          setMessage('Check your email for the confirmation link.');
        } else {
          setMessage('Account created successfully!');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4 selection:bg-yellow-500/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/20"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-bold text-zinc-900 dark:text-white mb-2"
          >
            Streakly
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-zinc-500 dark:text-zinc-400"
          >
            Build better habits, one day at a time.
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800"
        >
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 text-center">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl mb-6 border border-red-100 dark:border-red-900/50"
              >
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm p-4 rounded-xl mb-6 border border-green-100 dark:border-green-900/50"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="block w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-zinc-900 dark:text-white placeholder-zinc-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="block w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-zinc-900 dark:text-white placeholder-zinc-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthView;
