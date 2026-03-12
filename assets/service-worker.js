const CACHE_VERSION = "upc-static-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./site.webmanifest",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/favicon.svg",
  "./assets/favicon-32.png",
  "./assets/favicon-16.png",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/launch/split-winner-social-card.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const url = new URL(event.request.url);
          const sameOrigin = url.origin === self.location.origin;
          if (sameOrigin && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          throw new Error("Offline and no cached response available.");
        });
    }),
  );
});
