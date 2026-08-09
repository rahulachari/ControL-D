// ControL-D Background Service Worker for System Notifications & Alarms
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      const title = payload.title || "Medication Reminder";
      const options = {
        body: payload.body || "It is time to take your medication.",
        icon: payload.icon || "/logo.png",
        badge: payload.badge || "/logo.png",
        tag: payload.tag || "med-reminder",
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 100, 200], // Distinctive vibration pattern
        data: payload.data || {},
        silent: false, // Ensures default OS sound plays
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
      console.error("Error parsing push payload", err);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/meds");
    })
  );
});
