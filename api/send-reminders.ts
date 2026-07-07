import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Configure Web Push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VITE_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time in SAST (UTC+2)
    const now = new Date();
    // Convert to SAST by adding 2 hours to UTC
    const sastTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const currentHour = sastTime.getUTCHours().toString().padStart(2, '0');
    const currentMin = sastTime.getUTCMinutes();

    console.log(`Current SAST Time: ${currentHour}:${currentMin.toString().padStart(2, '0')}`);

    // Fetch all reminders
    const { data: reminders, error: remindersError } = await supabase.from('reminders').select('*');
    if (remindersError) throw remindersError;

    // Check if any reminder matches the current time (within a 5 minute window since cron runs every 5 mins)
    const activeReminders = reminders.filter((reminder: any) => {
      const [rHour, rMin] = reminder.time_of_day.split(':').map(Number);
      
      // We check if the current time is within the last 5 minutes of the reminder time
      // This handles the fact that a 5-minute cron might fire slightly after the exact minute
      const currentTotalMins = Number(currentHour) * 60 + currentMin;
      const reminderTotalMins = rHour * 60 + rMin;
      
      const diff = currentTotalMins - reminderTotalMins;
      return diff >= 0 && diff < 5;
    });

    if (activeReminders.length === 0) {
      return res.status(200).json({ message: 'No reminders scheduled for this time window.' });
    }

    // Fetch all push subscriptions
    const { data: subscriptions, error: subError } = await supabase.from('push_subscriptions').select('*');
    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscribers found.' });
    }

    // Send the first matching reminder (usually just one)
    const reminderMessage = activeReminders[0].message;

    const payload = JSON.stringify({
      title: 'Habit Tracker',
      body: reminderMessage,
      icon: '/vite.svg', // Assuming vite.svg is the icon in public folder
      badge: '/vite.svg',
    });

    // Send push notification to all subscribed devices
    const pushPromises = subscriptions.map((sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      return webpush.sendNotification(pushSubscription, payload).catch((err) => {
        console.error('Failed to send notification to endpoint', sub.endpoint, err);
        // If the subscription is invalid/expired (status 410), we could delete it from DB here
        if (err.statusCode === 410) {
          return supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      });
    });

    await Promise.all(pushPromises);

    return res.status(200).json({ success: true, message: `Sent "${reminderMessage}" to ${subscriptions.length} devices.` });

  } catch (err: any) {
    console.error('Error in send-reminders:', err);
    return res.status(500).json({ error: err.message });
  }
}
