self.addEventListener(
  "push",
  (event) => {
    if (!event.data) return;

    let data;

    try {
      data = event.data.json();
    } catch {
      data = {
        title: "American Council",
        message: event.data.text(),
      };
    }

    const title =
      data.title ||
      "American Council";

    const options = {
      body:
        data.message ||
        "You have a new notification.",

      icon: "/icon-192.png",

      badge: "/icon-192.png",

      data: {
        href: data.href || "/notifications",
      },

      requireInteraction: false,
    };

    event.waitUntil(
      self.registration.showNotification(
        title,
        options,
      ),
    );
  },
);

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const href =
      event.notification?.data?.href ||
      "/notifications";

    event.waitUntil(
      clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      }).then((clientList) => {
        for (const client of clientList) {
          if (
            "focus" in client
          ) {
            client.navigate(href);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(href);
        }
      }),
    );
  },
);
