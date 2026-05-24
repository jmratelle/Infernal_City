// Retired service worker.
//
// The previous custom worker cached Next app bundles too aggressively on mobile
// PWAs. Keep this file so existing installs can update, clear old caches, and
// unregister themselves.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.registration.unregister();
    await self.clients.claim();
  })());
});
