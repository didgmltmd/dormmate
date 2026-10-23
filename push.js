/* Web Push: payload carries only a generic title and an in-app link. */
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* ignore */ }
  // Server links are app routes ("/app/..."); resolve them under this app's base path.
  const route = typeof data.link === "string" && data.link.startsWith("/") ? data.link : "/app/inbox";
  const link = new URL(route.replace(/^\//, ""), self.registration.scope).href;
  event.waitUntil(
    self.registration.showNotification(data.title || "DormMate", {
      body: "앱에서 확인해 주세요.",
      icon: "brand/conobee-192.png",
      badge: "brand/conobee-favicon.png",
      data: { link },
      tag: link,
    }),
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || self.registration.scope;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (new URL(w.url).origin === self.location.origin) { w.navigate(link); return w.focus(); }
      }
      return self.clients.openWindow(link);
    }),
  );
});
