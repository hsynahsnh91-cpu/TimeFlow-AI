const CACHE_NAME = 'tf-v1';
const ASSETS = ['/index.html', '/css/style.css', '/css/dashboard.css', '/css/auth.css', '/css/components.css', '/js/app.js', '/js/database.js', '/js/auth.js', '/js/settings.js', '/js/tasks.js', '/js/timer.js', '/js/location.js', '/js/charts.js', '/js/analytics.js', '/js/ui.js', '/js/notifications.js', '/js/pwa.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS.map(a => new URL(a, location).href))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(c => c !== CACHE_NAME).map(c => caches.delete(c)))).then(() => self.clients.claim())));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('openstreetmap') || e.request.url.includes('nominatim') || e.request.url.includes('chart.js') || e.request.url.includes('leaflet')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      if (r.status === 200) { const clone = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, clone)); }
      return r;
    }))
  );
});

self.addEventListener('sync', (e) => {
  if (e.tag === 'tf-sync') {
    e.waitUntil(Promise.resolve().then(() => console.log('Background Sync Flushed')));
  }
});