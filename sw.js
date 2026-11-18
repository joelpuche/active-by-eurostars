/* Service worker: la app (archivos estáticos) funciona sin conexión. Nunca cachea llamadas a la API. */
var CACHE = 'active-mvp-v5';
var ASSETS = ['./', 'index.html', 'css/styles.css', 'js/config.js', 'js/data.js', 'js/i18n.js', 'js/app.js', 'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'img/partners/bamvolea.svg', 'img/partners/davidlloyd.svg', 'img/logo/active-isotipo-burgundy.svg', 'img/logo/active-isotipo-white.svg', 'img/partners/holmesplace.svg', 'img/partners/playtomic.svg', 'img/partners/strava.svg', 'img/partners/decathlon.svg', 'img/partners/hyrox.png', 'img/partners/asics.svg'].concat(
  ['run1','run2','run3','run4','run5','run6','run7','run8','run9','run10','padel1','padel2','padel3'].map(function (n) { return 'img/' + n + '.jpg'; }));
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var cacheable = url.origin === self.location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'cdnjs.cloudflare.com';
  if (!cacheable) return; // Supabase y otras APIs: siempre a la red
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
