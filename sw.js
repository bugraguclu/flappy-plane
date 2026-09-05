/* Flappy Plane — çevrimdışı önbellek.
   Oyun tek dosya olduğu için önbellek de tek girişten ibaret.
   index.html güncellenince CACHE sürümünü artır: v1 → v2. */
const CACHE = 'flappy-plane-v3';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html']))
    .then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* HTML'de önce ağ (güncelleme anında gelsin), ağ yoksa önbellek. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) (await caches.open(CACHE)).put('./index.html', fresh.clone());
      return fresh;
    } catch (err) {
      const c = await caches.open(CACHE);
      return (await c.match(req)) || (await c.match('./index.html')) || Response.error();
    }
  })());
});
