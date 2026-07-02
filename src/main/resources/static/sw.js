const CACHE = 'orsai-v3';
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

self.addEventListener('push', e => {
    let data = { title: 'ORSAI Mundial', body: '¡Hay novedades!', icon: '/icons/ORSAI-192.png', url: '/' };
    try { data = Object.assign(data, e.data.json()); } catch (_) {}

    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: '/icons/ORSAI-badge.png',
            data: { url: data.url },
            vibrate: [200, 100, 200]
        })
    );
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    const url = (e.notification.data && e.notification.data.url) || '/';
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});

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