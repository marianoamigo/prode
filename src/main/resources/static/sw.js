const CACHE = 'orsai-v2';
const STATIC = ['/', '/index.html', '/css/style.css', '/js/navbar.js', '/js/app.js', '/js/bottomNav.js', '/manifest.json'];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {})));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => clients.claim())
    );
});

function shouldSkipCache(url) {
    return url.includes('/api/')
        || url.includes('/oauth2/')
        || url.includes('/login/')
        || url.includes('/logout')
        || url.includes('/error');
}

self.addEventListener('fetch', e => {
    if (!e.request.url.startsWith('http')) return;

    if (shouldSkipCache(e.request.url)) {
        e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
        return;
    }

    if (e.request.method !== 'GET') {
        e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
        return;
    }

    e.respondWith(
        caches.match(e.request).then(cached => {
            const networkFetch = fetch(e.request)
                .then(res => {
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
                    }
                    return res;
                })
                .catch(() => cached || new Response('', { status: 503 }));
            return cached || networkFetch;
        })
    );
});