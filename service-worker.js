// === Service Worker (safe for Telegram widget & external origins) ===
const CACHE_NAME = 'cek-rekening-cache-v69';

// Only cache *local* static assets.
// Do NOT cache functions endpoints or external URLs.
const urlsToCache = [
  '/',
  '/index.html?v=3',
  '/assets/js/jquery.min.js',
  '/assets/css/fontawesome.min.css',
  '/assets/css/fonts.css',
  '/favicon.png?v=1',
  '/reset-password.html?v=2',
  '/login.html?v=2',
  // Optional: add '/offline.html' if you have one
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => {
        // Ready to switch immediately
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Precache failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names.map((name) => (name !== CACHE_NAME ? caches.delete(name) : undefined))
        )
      )
      .catch((e) => console.error('[SW] Clean caches error:', e))
  );
  self.clients.claim();
});

// Allow page to trigger skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1) Never handle non-GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 2) Ignore cross-origin (e.g., https://telegram.org, Firebase, etc.)
  if (url.origin !== self.location.origin) {
    // Let the browser fetch it normally (DO NOT event.respondWith)
    return;
  }

  // 3) Do not cache Netlify functions or other dynamic endpoints
  if (url.pathname.startsWith('/.netlify/functions/')) {
    return; // network-only
  }

  // 4) Never cache version.json - always fetch from network
  if (url.pathname === '/version.json') {
    return; // network-only for auto-update check
  }

  // 5) Cache-first for local static assets, with network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Optionally cache successful same-origin responses
          const resClone = res.clone();
          if (res.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
          }
          return res;
        })
        .catch((err) => {
          console.warn('[SW] Fetch failed:', url.href, err);
          // Optional: serve offline page only for navigations
          if (req.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          // Otherwise, just fail
          return Promise.reject(err);
        });
    })
  );
});
