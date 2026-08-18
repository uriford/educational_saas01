import "server-only";

import Pusher from "pusher";

let pusher: Pusher | null = null;

export function getPusherServer() {
  if (pusher) {
    return pusher;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new Error(
      "Pusher environment variables are missing.",
    );
  }

  pusher = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusher;
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

export async function publishChatMessage(
  organizationId: string,
  conversationId: string,
  message: unknown,
) {
  try {
    const client = getPusherServer();

    await client.trigger(
      getChatPrivateChannelName(
        organizationId,
        conversationId,
      ),
      "chat-message-created",
      message,
    );
  } catch (error) {
    console.error(
      "Pusher message broadcast failed:",
      error,
    );
  }
}

export async function publishChatMessageStatus(
  organizationId: string,
  conversationId: string,
  data: {
    messageId: string;
    status: "DELIVERED" | "SEEN";
  },
) {
  try {
    const client = getPusherServer();

    await client.trigger(
      getChatPrivateChannelName(
        organizationId,
        conversationId,
      ),
      "chat-message-status",
      data,
    );
  } catch (error) {
    console.error(
      "Pusher status broadcast failed:",
      error,
    );
  }
}
