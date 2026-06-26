// ============================================================
// SERVICE WORKER — Portal Pengusaha Ternakan DVS Malaysia
// ============================================================
const CACHE_NAME = 'dvs-ternakan-v4';
// Bump this value when cached static pages need to refresh on devices.
const CACHE_URLS = [
  '/listpengusaha/',
  '/listpengusaha/index.html',
  '/listpengusaha/students.html',
  '/listpengusaha/manual.html',
  '/listpengusaha/manifest.json'
];

// Install — cache fail utama
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — padam cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_NAME)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip GAS API calls — sentiasa ambil dari network
  if (e.request.url.includes('script.google.com') ||
      e.request.url.includes('googleapis.com')) {
    return fetch(e.request);
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache salinan terkini
        if (res.ok && e.request.method === 'GET') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
