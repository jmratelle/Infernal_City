// public/sw.js

// A simple "Network First for HTML, Cache First for assets" SW

const SW_VERSION = 'v1';
const HTML_CACHE = `html-cache-${SW_VERSION}`;
const ASSET_CACHE = `asset-cache-${SW_VERSION}`;

self.addEventListener('install', (event) => {
  // Activate new SW immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim clients and clean old caches
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((k) => {
        if (![HTML_CACHE, ASSET_CACHE].includes(k)) return caches.delete(k);
      })
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GET requests
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // HTML navigations: Network First, fallback to cache
  const isNavigation =
    req.mode === 'navigate' ||
    (req.destination === 'document' && req.headers.get('accept')?.includes('text/html'));

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(HTML_CACHE);
        // Clone before caching
        cache.put(req, res.clone());
        return res;
      } catch {
        const cache = await caches.open(HTML_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        // Optional: return a minimal offline page
        return new Response(
          `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:16px system-ui;padding:24px;background:#111;color:#fff"><h1>Offline</h1><p>No cached copy is available yet. Open this page once while online.</p></body>`,
          { headers: { 'Content-Type': 'text/html; charset=UTF-8' } }
        );
      }
    })());
    return;
  }

  // Static assets (js, css, images, fonts): Cache First
  const isAsset = /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?)$/i.test(url.pathname);
  if (isAsset) {
    event.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      // Only cache successful, basic/opaque responses
      if (res && (res.status === 200 || res.type === 'opaque')) {
        cache.put(req, res.clone());
      }
      return res;
    })());
  }
});
