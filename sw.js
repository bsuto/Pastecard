const cacheVersion = '1.7.2';

// add the files to the cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheVersion).then(cache => {
      return cache.addAll(['index.html','pastecard.js','styles.css']);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// serve files if cached, otherwise go to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== cacheVersion) return caches.delete(key);
      }));
    }));
  return self.clients(claim);
});