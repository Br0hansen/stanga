// Service worker: gjør at appen virker uten nett.
// Når du endrer index.html: øk versjonsnummeret under (og APP_VERSION i index.html).
const CACHE = 'stanga-v13';
const FILES = ['./', './index.html', './manifest.json', './okter.json', './icon-180.png', './icon-192.png', './icon-512.png'];

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

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // 3a) Selve appen: prøv nettet først (maks 3 sekunder), så du får nye versjoner med en gang.
  //     Uten nett, eller hvis nettet er tregt, brukes den lagrede versjonen.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(no, 3000))]);
        if (res && res.ok) cache.put('./index.html', res.clone());
        return res;
      } catch (err) {
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }

  // 3b) Alt annet (ikoner, fonter): svar fra lageret med en gang, oppdater i bakgrunnen.
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req)
        .then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
