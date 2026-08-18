"use client";

import {
  getPusherClient,
  getChatPresenceChannelName,
} from "./chat-realtime";

export function getStaffPresenceChannelName(
  organizationId: string,
  conversationId: string,
) {
  return getChatPresenceChannelName(
    organizationId,
    conversationId,
  );
}

export function getStaffPresenceClient(
  organizationId: string,
  conversationId: string,
) {
  const pusher = getPusherClient();

  return pusher.subscribe(
    getStaffPresenceChannelName(
      organizationId,
      conversationId,
    ),
  );
}
