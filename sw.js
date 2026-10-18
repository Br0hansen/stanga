// Service worker: gjør at appen virker uten nett, og at du alltid får nyeste versjon når du har nett.
//
// Selve appen (index.html) hentes fra nettet hver gang den åpnes. Derfor trenger du IKKE endre noe
// her når du oppdaterer appen. Det holder å øke APP_VERSION i index.html.
// Øk SHELL under bare hvis du endrer logikken i denne filen eller listen over filer.
const SHELL = 'stanga-shell-1';
const FILES = ['./', './index.html', './manifest.json', './okter.json', './icon-180.png', './icon-192.png', './icon-512.png'];

// 1) Installasjon: legg alle filene i mellomlageret. cache:'reload' hopper over nettleserens
//    eget lager, så vi ikke lagrer en utdatert kopi.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL)
    .then(c => c.addAll(FILES.map(f => new Request(f, {cache:'reload'}))))
    .then(() => self.skipWaiting()));
});

// 2) Aktivering: rydd bort gamle mellomlagre (også de gamle stanga-v1 … stanga-v18).
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Hent fra nettet og spør alltid GitHub om filen er endret (cache:'no-cache').
// Er den uendret, svarer GitHub kort med «304 Not Modified», så det koster nesten ingenting.
// Uten nett, eller hvis nettet bruker mer enn 4 sekunder, brukes den lagrede kopien.
async function networkFirst(url, cacheKey){
  const cache = await caches.open(SHELL);
  try {
    const res = await Promise.race([
      fetch(url, {cache:'no-cache'}),
      new Promise((_, no) => setTimeout(no, 4000))
    ]);
    if (!res || !res.ok) throw 0;
    // Safari godtar ikke et omdirigert svar på en sidevisning. Lag en ren kopi.
    const clean = res.redirected ? new Response(await res.blob(), {status:res.status, statusText:res.statusText, headers:res.headers}) : res;
    cache.put(cacheKey, clean.clone());
    return clean;
  } catch (err) {
    return (await cache.match(cacheKey)) || (await cache.match('./')) || Response.error();
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 3a) Selve appen, og appens egen sjekk av ny versjon (som ber om cache:'no-cache'): nett først.
  if (req.mode === 'navigate' || (url.origin === location.origin && (req.cache === 'no-cache' || req.cache === 'reload'))) {
    e.respondWith(networkFirst(req.mode === 'navigate' ? req.url : req, req.mode === 'navigate' ? './index.html' : req));
    return;
  }

  // 3b) Alt annet (ikoner, fonter, øktbanken): svar fra lageret med en gang, oppdater i bakgrunnen.
  e.respondWith(
    caches.open(SHELL).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req)
        .then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
