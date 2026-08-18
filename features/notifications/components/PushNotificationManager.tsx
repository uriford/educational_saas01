"use client";

import { useEffect } from "react";

export default function PushNotificationManager() {
  useEffect(() => {
    let cancelled = false;

    async function registerPush() {
      if (
        cancelled ||
        typeof window === "undefined"
      ) {
        return;
      }

      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        return;
      }

      const publicKey =
        process.env
          .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        console.warn(
          "NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing.",
        );

        return;
      }

      try {
        const registration =
          await navigator.serviceWorker.register(
            "/push-sw.js",
          );

        let permission =
          Notification.permission;

        if (
          permission === "default"
        ) {
          permission =
            await Notification.requestPermission();
        }

        if (
          permission !== "granted"
        ) {
          return;
        }

        let subscription =
          await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription =
            await registration.pushManager.subscribe({
              userVisibleOnly: true,

              applicationServerKey:
                urlBase64ToUint8Array(
                  publicKey,
                ) as BufferSource,
            });
        }

        await fetch(
          "/api/notifications/push/subscribe",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              subscription.toJSON(),
            ),
          },
        );
      } catch (error) {
        console.error(
          "PUSH REGISTRATION ERROR:",
          error,
        );
      }
    }

    registerPush();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

function urlBase64ToUint8Array(
  value: string,
) {
  const padding =
    "=".repeat(
      (4 - (value.length % 4)) % 4,
    );

  const base64 =
    (
      value +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (character) =>
        character.charCodeAt(0),
    ),
  );
}
