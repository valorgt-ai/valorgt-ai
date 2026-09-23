const CACHE_NAME = 'valorgt-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Responder desde la red, fallback a cache si no hay conexión
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
