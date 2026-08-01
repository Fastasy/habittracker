import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Bell, Save, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Reminder {
  id: string;
  time_of_day: string;
  message: string;
}

const SettingsView: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { signOut, user } = useAuth();

  useEffect(() => {
    fetchReminders();
    checkPushSubscription();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase.from('reminders').select('*').order('time_of_day', { ascending: true });
      if (error) throw error;
      if (data) {
        setReminders(data);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const checkPushSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setPushEnabled(true);
        }
      }
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const cleaned = base64String.replace(/[^A-Za-z0-9\+\/\-\_]/g, '');
    const padding = '='.repeat((4 - cleaned.length % 4) % 4);
    const base64 = (cleaned + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnablePush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported by your browser.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied.');
      }

      let registration = await navigator.serviceWorker.register('/sw.js');
      registration = await navigator.serviceWorker.ready;

      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) throw new Error('VAPID public key is missing from environment variables.');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      const subJSON = subscription.toJSON();
      const { error } = await supabase.from('push_subscriptions').insert({
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys?.p256dh,
        auth: subJSON.keys?.auth,
      });

      if (error && error.code !== '23505') {
        throw error;
      }

      setPushEnabled(true);
      setMessage({ type: 'success', text: 'Push notifications enabled successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSaveReminders = async () => {
    setSaving(true);
    setMessage(null);
    try {
      for (const reminder of reminders) {
        const { error } = await supabase
          .from('reminders')
          .update({ time_of_day: reminder.time_of_day, message: reminder.message })
          .eq('id', reminder.id);
        if (error) throw error;
      }
      setMessage({ type: 'success', text: 'Reminders saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const updateReminder = (id: string, field: 'time_of_day' | 'message', value: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  if (loading) {
    return <div className="p-8 text-center text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Loading Settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">System Configuration</h2>
        <p className="text-sm text-zinc-500 tracking-wide mt-1">Manage notifications, schedules, and account preferences.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Push Notification Toggle */}
      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-xl p-6 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
              <Bell className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Push Notifications</h3>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1 max-w-sm">
                Receive device-level alerts for scheduled routines
              </p>
            </div>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={pushEnabled}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
              pushEnabled
                ? 'bg-transparent border-emerald-500/30 text-emerald-500 cursor-default'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 border-transparent shadow-sm'
            }`}
          >
            {pushEnabled ? 'Authorized' : 'Enable Access'}
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/80">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Daily Reminders</h3>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
            Configure system alerts. Times localized to current timezone.
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {reminders.map((reminder, index) => (
            <div key={reminder.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Time (24h)</label>
                <input
                  type="time"
                  value={reminder.time_of_day}
                  onChange={(e) => updateReminder(reminder.id, 'time_of_day', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Message Payload</label>
                <input
                  type="text"
                  value={reminder.message}
                  onChange={(e) => updateReminder(reminder.id, 'message', e.target.value)}
                  placeholder="Enter reminder payload..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
          ))}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveReminders}
              disabled={saving || reminders.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Synchronizing...' : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configurations
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md rounded-xl p-6 border border-red-200 dark:border-red-900/30 shadow-sm mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-900/50">
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Terminate Session</h3>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1 max-w-sm">
                Active connection: <span className="font-bold text-zinc-700 dark:text-zinc-400">{user?.email || 'Unknown'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-all border border-red-200 dark:border-red-800/50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
