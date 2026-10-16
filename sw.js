// Service worker: gjør at appen virker uten nett.
// Når du endrer index.html: øk versjonsnummeret under, så henter telefonen den nye versjonen.
const CACHE = 'stanga-v4';
const FILES = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

// 1) Installasjon: legg alle filene i mellomlageret.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// 2) Aktivering: rydd bort gamle versjoner.
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 3) Hver forespørsel: svar fra lageret med en gang, og oppdater lageret i bakgrunnen.
//    (Kalles "stale-while-revalidate". Fonter fra Google lagres også, så de virker offline.)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request)
        .then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone()); return res; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
