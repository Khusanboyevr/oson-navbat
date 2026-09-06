// Qulaynavbat service worker — handles Web Push delivery while the app is closed
// and forwards notification clicks back into an open (or newly focused) tab.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Qulaynavbat", body: event.data.text() };
  }

  const title = payload.title || "Qulaynavbat";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    data: { url: payload.url || "/" },
    tag: payload.tag,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.includes(targetUrl));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Offline shell. A browser only offers to install an app it can open without a
// network, so navigations fall back to a cached copy of the last page that
// loaded. Everything else goes straight to the network — this is not a cache
// layer for the app's data, which must always be fresh.
const SHELL_CACHE = "qn-shell-v1";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.add(OFFLINE_URL)));
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        void caches.open(SHELL_CACHE).then((cache) => cache.put(OFFLINE_URL, copy));
        return response;
      })
      .catch(async () => (await caches.match(OFFLINE_URL)) || Response.error())
  );
});
