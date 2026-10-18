// MusicHub: «помощник», который позволяет открыть плеер без интернета.
// Сначала берёт свежую страницу из сети, а если сети нет — показывает сохранённую копию.
// Запросы к Яндекс Диску не трогает (музыка, скачанная на телефон, хранится отдельно).
const CACHE = "musichub-page-v1";
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./"])).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const net = await Promise.race([fetch(r), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), r.mode === "navigate" ? 6000 : 15000))]);
      if (net.ok) cache.put(r.mode === "navigate" ? "./" : r, net.clone());
      return net;
    } catch (_) {
      return (await cache.match(r, { ignoreSearch: true })) || (r.mode === "navigate" && await cache.match("./")) || Response.error();
    }
  })());
});
