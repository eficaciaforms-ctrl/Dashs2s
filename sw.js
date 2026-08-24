// ═══════════════════════════════════════════════════════════
// sw.js — SERVICE WORKER DE AUTO-DESTRUCCIÓN (Dashboard S2S)
// Propósito: eliminar el service worker viejo que quedó registrado
// por error (cacheaba el app) y devolver el dashboard a la normalidad.
// No cachea nada: deja pasar todo a la red y se desinstala solo.
// ═══════════════════════════════════════════════════════════
self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    // 1) Borrar TODAS las cachés (incluida la del app que quedó pegada)
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    } catch (err) {}
    // 2) Desinstalar este service worker
    try { await self.registration.unregister(); } catch (err) {}
    // 3) Recargar todas las pestañas abiertas para que carguen el dashboard real
    try {
      var clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach(function (c) { c.navigate(c.url); });
    } catch (err) {}
  })());
});

// No interceptar solicitudes: todo va directo a la red (sin caché)
self.addEventListener('fetch', function (e) { /* passthrough */ });
