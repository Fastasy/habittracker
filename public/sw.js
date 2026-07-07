self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/vite.svg',
        badge: data.badge || '/vite.svg',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: '2'
        }
      };
      event.waitUntil(self.registration.showNotification(data.title || 'Habit Tracker', options));
    } catch (e) {
      // Fallback if not JSON
      event.waitUntil(
        self.registration.showNotification('Habit Tracker', {
          body: event.data.text(),
          icon: '/vite.svg',
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // Open the app when clicked
  event.waitUntil(clients.openWindow('/'));
});
