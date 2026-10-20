/* ---------------------- 离线缓存（单文件版） ---------------------- */
'use strict';
const CACHE_VERSION = 'jizhang-single-v1.1.4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin){ return; }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if(res && res.status === 200 && res.type === 'basic'){
      const copy = res.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
    }
    return res;
  }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : new Response('', { status:504 }))));
});
