const CACHE_NAME = 'honore-portfolio-v1';
const ASSETS_TO_CACHE = [
  '/frontend/index.html',
  '/frontend/assets/css/styles.css',
  '/frontend/assets/images/profile.jpg',
  '/frontend/assets/images/favicon-circle.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
