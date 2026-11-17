const APP = "comuni-cn-v70", TILES = "comuni-cn-tiles";
const SHELL = ["./", "index.html", "comuni.json", "leaflet.js", "leaflet.css", "manifest.webmanifest",
  "hero.jpg", "eggs/pellegrino.webp", "eggs/erbi.webp", "eggs/carosso2.webp", "eggs/ferrari.webp", "eggs/parrinello.webp", "eggs/carosso1.webp", "eggs/cavallo.webp", "eggs/barale.webp", "eggs/caroni.webp", "eggs/crosta.webp", "eggs/cavallera.webp", "eggs/baratteri.webp", "eggs/chiarpenello.webp",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "fonts/im-fell-english-latin-400-normal.woff2", "fonts/barlow-latin-400-normal.woff2", "fonts/barlow-latin-500-normal.woff2", "fonts/barlow-latin-600-normal.woff2",
  "fonts/barlow-condensed-latin-500-normal.woff2", "fonts/barlow-condensed-latin-600-normal.woff2", "fonts/barlow-condensed-latin-700-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(APP).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== APP && k !== TILES).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
    return;
  }
  if (/arcgisonline\.com/.test(url.hostname)) {
    e.respondWith(caches.open(TILES).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      try {
        const res = await fetch(e.request);
        if (res.ok || res.type === "opaque") {
          c.put(e.request, res.clone());
          c.keys().then(ks => { if (ks.length > 3000) ks.slice(0, ks.length - 3000).forEach(k => c.delete(k)); });
        }
        return res;
      } catch (err) { return new Response("", { status: 504 }); }
    }));
  }
});
