const CACHE_NAME = 'trivo-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin) || e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then((cached) => {
          return cached || new Response('Offline content not available', { status: 503 });
        });
      })
  );
});

self.addEventListener('push', (e) => {
  if (!e.data) return;

  const data = e.data.json();
  const options = {
    body: data.body || 'New update from Trivo Kenya',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  };

  e.waitUntil(
    self.registration.showNotification(data.title || 'Trivo Kenya', options)
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(clients.openWindow(url));
});
