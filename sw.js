// FitAI Service Worker — Offline Cache + Push Notifications
const CACHE = 'fitai-v7';
const ASSETS = ['/', '/app', '/app.html', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // Xoá cache cũ để người dùng nhận bản mới
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  // API: luôn lên mạng, không cache
  if (e.request.url.includes('/api/')) return;
  // Network-first, fallback cache (để luôn lấy bản mới khi có mạng)
  e.respondWith(
    fetch(e.request).then(res => {
      // cache lại bản mới của các file gốc
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/app.html')))
  );
});

// Push notification
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'FitAI', {
      body: data.body || 'Hết giờ nghỉ — vào set tiếp theo!',
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      tag: 'fitai-rest',
      requireInteraction: false,
      data: { url: '/app' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url.includes('/app') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('/app');
    })
  );
});
