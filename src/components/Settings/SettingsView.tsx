import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Bell, Save, CheckCircle2, AlertCircle } from 'lucide-react';

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
    // Clean up the string in case it has quotes or whitespace from env vars
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

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }

      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) throw new Error('VAPID public key is missing from environment variables.');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // Save subscription to Supabase
      const subJSON = subscription.toJSON();
      const { error } = await supabase.from('push_subscriptions').insert({
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys?.p256dh,
        auth: subJSON.keys?.auth,
      });

      if (error && error.code !== '23505') { // Ignore unique constraint if already subscribed
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
    return <div className="p-8 text-center text-zinc-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your notifications and daily reminders.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Push Notification Toggle */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Push Notifications</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                Receive reminders on your device even when the app is closed.
              </p>
            </div>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={pushEnabled}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              pushEnabled
                ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md'
            }`}
          >
            {pushEnabled ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Daily Reminders</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Customize the times and messages for your 3 daily reminders. Times should be in your local timezone.
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {reminders.map((reminder, index) => (
            <div key={reminder.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Time (24h)</label>
                <input
                  type="time"
                  value={reminder.time_of_day}
                  onChange={(e) => updateReminder(reminder.id, 'time_of_day', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Message</label>
                <input
                  type="text"
                  value={reminder.message}
                  onChange={(e) => updateReminder(reminder.id, 'message', e.target.value)}
                  placeholder="Enter reminder message..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />
              </div>
            </div>
          ))}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSaveReminders}
              disabled={saving || reminders.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
