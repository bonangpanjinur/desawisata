// public/sw.js
// Ini adalah service worker dasar untuk PWA.
// Anda bisa menggunakan library yang lebih canggih seperti workbox-nextjs nanti.

const CACHE_NAME = 'sadesa-cache-v1';
const urlsToCache = [
  '/',
  '/jelajah',
  '/keranjang',
  '/akun',
  '/src/styles/globals.css',
  // Anda perlu menambahkan ikon-ikon di folder public
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Hanya tangani request GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategi Cache-First untuk aset
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Ambil dari cache
        }
        // Jika tidak ada di cache, ambil dari network
        return fetch(event.request).then(
          (response) => {
            // Cek jika response valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response untuk disimpan di cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

