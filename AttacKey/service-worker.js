

const CACHE_NAME = 'AttacKey-static'; // Cache name without versioning

// Function to request persistent storage
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persistent storage granted: ${isPersisted}`);
    } else {
        console.log('Persistent storage is not supported by this browser');
    }
}

self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            // Request persistent storage
            await requestPersistentStorage();
            // Open the cache and add all required resources
            const cache = await caches.open(CACHE_NAME);
            console.log("Caching data");
            try {
                await cache.addAll([
                    './',
                    './faust-ui/index.js',
                    './faust-ui/index.css',
                    './faustwasm/index.js',
                    './index.html',
                    './AttacKey.js',
                    './AttacKey.wasm',
                    './AttacKey.json',
                ]);
            } catch (error) {
                // Catch and log any errors during the caching process
                console.error('Failed to cache resources during install:', error);
            }
        })()
    );
});

/*
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching datas");
            return cache.addAll([
                './',
                './faust-ui/index.js',
                './faust-ui/index.css',
                './faustwasm/index.js',
                './index.html',
                './AttacKey.js',
                './AttacKey.wasm',
                './AttacKey.json',
            ]).catch(error => {
                // Catch and log any errors during the caching process
                console.error('Failed to cache resources during install:', error);
            });
        })
    );
});
*/

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        // Delete caches that do not match the current cache name
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Return the cached response if found, else fetch from network
            return response || fetch(event.request).catch(() => {
                // Fallback content or page for failed network requests
                return caches.match('./offline.html');
            });
        })
    );
});
