// Service Worker for offline functionality
const CACHE_NAME = 'hse-inspection-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/services/supabase.js',
  '/src/services/auth.js',
  '/src/services/validation.js',
  '/src/services/offline.js',
  '/src/services/realtime.js',
  '/src/ui/ui-manager.js',
  '/src/ui/dashboard.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // This would sync with the main app's offline service
  console.log('Background sync triggered');
}