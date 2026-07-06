self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      
      const options = {
        body: data.body || 'You have a new notification!',
        icon: '/vite.svg', // Update with a real app icon path if available
        badge: '/vite.svg',
        data: {
          url: data.url || '/'
        },
        vibrate: [200, 100, 200]
      };

      event.waitUntil(
        self.registration.showNotification(data.title || 'Vadtrans Alert', options)
      );
    } catch (e) {
      console.error('Error parsing push data:', e);
      // Fallback for non-json payload
      event.waitUntil(
        self.registration.showNotification('Vadtrans Alert', {
          body: event.data.text(),
          icon: '/vite.svg',
          vibrate: [200, 100, 200]
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          // If so, just focus it.
          if (client.url.includes(event.notification.data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, then open the target URL in a new window/tab.
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});
