import "server-only";

import Pusher from "pusher";

let pusher: Pusher | null = null;

function getPusherServer() {
  if (pusher) {
    return pusher;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new Error(
      "Pusher server environment variables are not configured.",
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

function getPrivateChannelName(
  organizationId: string,
  conversationId: string,
) {
  return `private-chat-${organizationId}-${conversationId}`;
}

export async function publishChatEvent(
  organizationId: string,
  conversationId: string,
  event: string,
  data: unknown,
) {
  const client = getPusherServer();

  await client.trigger(
    getPrivateChannelName(
      organizationId,
      conversationId,
    ),
    event,
    data,
  );
}

export async function publishChatMessage(
  organizationId: string,
  conversationId: string,
  message: unknown,
) {
  await publishChatEvent(
    organizationId,
    conversationId,
    "chat-message-created",
    message,
  );
}

export async function publishChatMessageReaction(
  organizationId: string,
  conversationId: string,
  data: {
    messageId: string;
    reactions: Array<{
      id: string;
      messageId: string;
      userId: string;
      emoji: string;
      createdAt: string;
    }>;
  },
) {
  await publishChatEvent(
    organizationId,
    conversationId,
    "chat-message-reaction",
    data,
  );
}

export async function publishChatMessageStatus(
  organizationId: string,
  conversationId: string,
  data: {
    messageId: string;
    status: "DELIVERED" | "SEEN";
    deliveredAt?: Date | null;
    seenAt?: Date | null;
    updatedBy?: string;
  },
) {
  await publishChatEvent(
    organizationId,
    conversationId,
    "chat-message-status",
    data,
  );
}

export async function authenticatePusherChannel(
  socketId: string,
  channelName: string,
  userId: string,
  userName?: string | null,
  userImage?: string | null,
) {
  const client = getPusherServer();

  return client.authorizeChannel(
    socketId,
    channelName,
    {
      user_id: userId,
      user_info: {
        name: userName ?? "User",
        image: userImage ?? null,
      },
    },
  );
}

export async function publishStaffPresence(
  organizationId: string,
  staffId: string,
  data: {
    status: "ONLINE" | "OFFLINE" | "BUSY";
    activityState: "ACTIVE" | "AWAY" | "OFFLINE" | "BUSY";
    lastSeenAt?: Date | null;
    lastActiveAt?: Date | null;
  },
) {
  const client = getPusherServer();

  await client.trigger(
    `private-staff-${organizationId}`,
    "staff-presence-updated",
    {
      staffId,
      status: data.status,
      activityState: data.activityState,
      lastSeenAt:
        data.lastSeenAt?.toISOString() ?? null,
      lastActiveAt:
        data.lastActiveAt?.toISOString() ?? null,
    },
  );
}

export async function publishConversationAssignment(
  organizationId: string,
  conversationId: string,
  data: {
    assignedStaffId: string | null;
  },
) {
  const client = getPusherServer();

  await client.trigger(
    `private-staff-${organizationId}`,
    "conversation-assignment-updated",
    {
      conversationId,
      assignedStaffId:
        data.assignedStaffId,
    },
  );
}

export async function publishChatMessageUpdated(
  organizationId: string,
  conversationId: string,
  message: {
    id: string;
    conversationId: string;
    senderId: string | null;
    content: string;
    editedAt: Date | null;
    updatedAt: Date;
  },
) {
  await publishChatEvent(
    organizationId,
    conversationId,
    "chat-message-updated",
    {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      editedAt: message.editedAt?.toISOString() ?? null,
      updatedAt: message.updatedAt.toISOString(),
    },
  );
}

export async function publishChatMessageDeleted(
  organizationId: string,
  conversationId: string,
  data: {
    messageId: string;
    deletedAt: Date;
  },
) {
  await publishChatEvent(
    organizationId,
    conversationId,
    "chat-message-deleted",
    {
      messageId: data.messageId,
      deletedAt: data.deletedAt.toISOString(),
    },
  );
}
