/* ---------------------- 离线缓存 ---------------------- */
'use strict';

const CACHE_VERSION = 'jizhang-v1.0.5';
const SHELL = [
  './',
  './index.html',
  './css/app.css',
  './js/util.js',
  './js/db.js',
  './js/stats.js',
  './js/io.js',
  './js/app.js',
  './vendor/xlsx.full.min.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin){ return; }

  event.respondWith(
    caches.match(req).then(hit => {
      if(hit){ return hit; }
      return fetch(req).then(res => {
        if(res && res.status === 200 && res.type === 'basic'){
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        if(req.mode === 'navigate'){ return caches.match('./index.html'); }
        return new Response('', { status: 504 });
      });
    })
  );
});
