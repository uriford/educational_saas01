"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

export function getPusherClient() {
  if (typeof window === "undefined") {
    throw new Error(
      "Pusher client can only run in the browser.",
    );
  }

  const key =
    process.env.NEXT_PUBLIC_PUSHER_KEY;

  const cluster =
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error(
      "NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER is missing.",
    );
  }

  if (!pusherClient) {
    if (process.env.NODE_ENV === "development") {
      Pusher.logToConsole = true;
    }

    pusherClient =
      new Pusher(key, {
        cluster,
        forceTLS: true,
        channelAuthorization: {
          endpoint: "/api/pusher/auth",
          transport: "ajax",
        },
      });

    pusherClient.connection.bind(
      "connected",
      () => {
        console.log(
          "[Pusher] Connected:",
          pusherClient?.connection.socket_id,
        );
      },
    );

    pusherClient.connection.bind(
      "disconnected",
      () => {
        console.warn("[Pusher] Disconnected");
      },
    );

    pusherClient.connection.bind(
      "error",
      (error: unknown) => {
        console.error("[Pusher] Connection error:", error);

        try {
          console.error(
            "[Pusher] Connection state:",
            pusherClient?.connection.state,
          );

          console.error(
            "[Pusher] Connection socket ID:",
            pusherClient?.connection.socket_id,
          );

          console.error(
            "[Pusher] Connection error details:",
            JSON.stringify(error, null, 2),
          );
        } catch (debugError) {
          console.error(
            "[Pusher] Debug logging failed:",
            debugError,
          );
        }
      },
    );

    pusherClient.connection.bind(
      "state_change",
      (states: unknown) => {
        console.log(
          "[Pusher] State:",
          states,
        );
      },
    );
  }

  return pusherClient;
}

export function getChatPrivateChannelName(
  organizationId: string,
  conversationId: string,
) {
  return `private-chat-${organizationId}-${conversationId}`;
}

export function getChatPresenceChannelName(
  organizationId: string,
  conversationId: string,
) {
  return `presence-chat-${organizationId}-${conversationId}`;
}
