import "server-only";

import { db } from "@/lib/db";

/**
 * Shared reaction selection.
 *
 * Keeping this centralized guarantees that every repository method
 * returns the same reaction shape.
 */
const reactionSelect = {
  id: true,
  messageId: true,
  userId: true,
  emoji: true,
  createdAt: true,
} as const;

/**
 * Shared message include.
 *
 * This is intentionally kept compatible with the existing UI shape.
 */
const messageInclude = {
  /**
   * Sender identity is loaded with every message so the UI can
   * render the sender's real name and profile avatar.
   *
   * AI messages have senderId = null, so sender will simply be null.
   */
  sender: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  },

  attachments: true,

  reactions: {
    orderBy: {
      createdAt: "asc" as const,
    },
    select: reactionSelect,
  },
} as const;

/**
 * Shared student selection.
 */
const studentSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: true,
} as const;

/**
 * Shared staff selection.
 */
const assignedStaffSelect = {
  id: true,
  userId: true,
  position: true,
  status: true,
  canReply: true,
  canViewAllChats: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  },
} as const;

/**
 * Normalizes user-generated message content.
 *
 * We intentionally preserve whitespace inside the message while
 * preventing an entirely empty message from being stored.
 */
function normalizeMessageContent(content: string) {
  const normalized = content.trim();

  if (!normalized) {
    throw new Error("Message content cannot be empty");
  }

  return normalized;
}

/**
 * Shared full conversation include.
 */
const conversationInclude = {
  student: {
    select: studentSelect,
  },
  assignedStaff: {
    select: assignedStaffSelect,
  },
  messages: {
    include: messageInclude,
    orderBy: {
      createdAt: "asc" as const,
    },
  },
} as const;

/**
 * Find the currently open student conversation.
 */
export async function findStudentConversation(
  organizationId: string,
  studentId: string,
) {
  return db.chatConversation.findFirst({
    where: {
      organizationId,
      studentId,
      status: "OPEN",
    },
    include: {
      messages: {
        include: messageInclude,
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

/**
 * Creates a conversation for a student.
 */
export async function createConversation(data: {
  organizationId: string;
  studentId: string;
}) {
  return db.chatConversation.create({
    data: {
      organizationId: data.organizationId,
      studentId: data.studentId,
    },
    include: {
      messages: {
        include: messageInclude,
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

/**
 * Returns a conversation inside the supplied organization.
 *
 * This function intentionally does not perform role authorization.
 * Authorization belongs in the service/action layer.
 */
export async function getConversationById(
  conversationId: string,
  organizationId: string,
) {
  return db.chatConversation.findFirst({
    where: {
      id: conversationId,
      organizationId,
    },
    include: conversationInclude,
  });
}

/**
 * Student-scoped conversation lookup.
 */
export async function getStudentConversation(
  conversationId: string,
  organizationId: string,
  studentId: string,
) {
  return db.chatConversation.findFirst({
    where: {
      id: conversationId,
      organizationId,
      studentId,
    },
    include: conversationInclude,
  });
}

/**
 * Guardian-scoped conversation lookup.
 *
 * The caller must verify that the guardian is actually related to
 * the supplied student through the GuardianStudent relation.
 *
 * NOTE:
 * studentUserId is retained for compatibility with the existing
 * caller contract. The existing schema uses conversation.studentId
 * for this relationship.
 */
export async function getGuardianStudentConversation(
  conversationId: string,
  organizationId: string,
  studentUserId: string,
) {
  return db.chatConversation.findFirst({
    where: {
      id: conversationId,
      organizationId,
      studentId: studentUserId,
    },
    include: conversationInclude,
  });
}

/**
 * Verifies that a conversation exists inside an organization.
 *
 * This is intentionally lightweight and should be preferred over
 * loading a complete conversation when performing mutations.
 */
export async function assertConversationInOrganization(
  conversationId: string,
  organizationId: string,
) {
  return db.chatConversation.findFirst({
    where: {
      id: conversationId,
      organizationId,
    },
    select: {
      id: true,
      organizationId: true,
      studentId: true,
      assignedStaffId: true,
      status: true,
    },
  });
}

/**
 * Returns a message reaction state scoped to an organization.
 */
export async function getMessageReactionState(
  messageId: string,
  organizationId: string,
) {
  return db.chatMessage.findFirst({
    where: {
      id: messageId,
      conversation: {
        organizationId,
      },
    },
    select: {
      id: true,
      reactions: {
        orderBy: {
          createdAt: "asc",
        },
        select: reactionSelect,
      },
    },
  });
}

/**
 * Adds, changes, or removes the current user's reaction.
 *
 * One reaction per user per message is enforced by the existing
 * messageId_userId unique constraint.
 */
export async function toggleMessageReaction(data: {
  messageId: string;
  userId: string;
  emoji: string;
  organizationId: string;
}) {
  const emoji = data.emoji.trim();

  if (!emoji) {
    throw new Error("Reaction emoji is required");
  }

  const message = await db.chatMessage.findFirst({
    where: {
      id: data.messageId,
      conversation: {
        organizationId: data.organizationId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  const existing = await db.chatMessageReaction.findUnique({
    where: {
      messageId_userId: {
        messageId: data.messageId,
        userId: data.userId,
      },
    },
  });

  if (existing) {
    if (existing.emoji === emoji) {
      await db.chatMessageReaction.delete({
        where: {
          id: existing.id,
        },
      });
    } else {
      await db.chatMessageReaction.update({
        where: {
          id: existing.id,
        },
        data: {
          emoji,
        },
      });
    }
  } else {
    await db.chatMessageReaction.create({
      data: {
        messageId: data.messageId,
        userId: data.userId,
        emoji,
      },
    });
  }

  return getMessageReactionState(
    data.messageId,
    data.organizationId,
  );
}

/**
 * Creates a normal user message.
 */
export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  organizationId: string;
  attachments?: Array<{
    fileName: string;
    storagePath: string;
    publicUrl: string;
    mimeType: string;
    fileSize: number;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
  }>;
}) {
  const conversation = await assertConversationInOrganization(
    data.conversationId,
    data.organizationId,
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const content = normalizeMessageContent(data.content);

  const attachments = data.attachments?.filter(
    (attachment) =>
      attachment.fileName.trim() &&
      attachment.storagePath.trim() &&
      attachment.publicUrl.trim() &&
      attachment.mimeType.trim() &&
      Number.isFinite(attachment.fileSize) &&
      attachment.fileSize >= 0,
  );

  return db.chatMessage.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      content,
      isAIResponse: false,

      attachments: attachments?.length
        ? {
            create: attachments,
          }
        : undefined,
    },

    include: messageInclude,
  });
}

/**
 * Creates an AI-generated message.
 */
export async function createAIMessage(data: {
  conversationId: string;
  content: string;
  organizationId: string;
}) {
  const conversation = await assertConversationInOrganization(
    data.conversationId,
    data.organizationId,
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const content = normalizeMessageContent(data.content);

  return db.chatMessage.create({
    data: {
      conversationId: data.conversationId,
      senderId: null,
      content,
      isAIResponse: true,
    },
    include: messageInclude,
  });
}

/**
 * Returns all conversations for an organization.
 *
 * Only the latest message is loaded for each conversation.
 * This is substantially cheaper for the Staff Inbox than loading
 * complete histories.
 */
export async function getOrganizationConversations(
  organizationId: string,
) {
  return db.chatConversation.findMany({
    where: {
      organizationId,
    },
    include: {
      student: {
        select: studentSelect,
      },
      assignedStaff: {
        select: assignedStaffSelect,
      },
      messages: {
        include: messageInclude,
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

/**
 * Assigns or unassigns a staff member.
 *
 * We first verify the conversation belongs to the organization
 * instead of relying on a compound Prisma unique constraint.
 */
export async function assignConversationStaff(
  conversationId: string,
  organizationId: string,
  staffId: string | null,
) {
  const conversation = await assertConversationInOrganization(
    conversationId,
    organizationId,
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (staffId) {
    const staff = await db.chatStaff.findFirst({
      where: {
        id: staffId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!staff) {
      throw new Error("Staff member not found");
    }
  }

  return db.chatConversation.update({
    where: {
      id: conversation.id,
    },
    data: {
      assignedStaffId: staffId,
    },
    include: conversationInclude,
  });
}

/**
 * Returns the chat-staff record belonging to a user
 * inside the supplied organization.
 */
export async function getChatStaffByUserId(
  organizationId: string,
  userId: string,
) {
  return db.chatStaff.findFirst({
    where: {
      organizationId,
      userId,
    },
    select: {
      id: true,
      organizationId: true,
      userId: true,
      position: true,
      status: true,
      lastSeenAt: true,
      lastActiveAt: true,
      canReply: true,
      canViewAllChats: true,
    },
  });
}

/**
 * Returns a conversation only when the supplied chat-staff
 * member is authorized to access it.
 */
export async function getStaffChatConversation(
  conversationId: string,
  organizationId: string,
  staffId: string,
  canViewAllChats: boolean,
) {
  return db.chatConversation.findFirst({
    where: {
      id: conversationId,
      organizationId,
      ...(canViewAllChats
        ? {}
        : {
            assignedStaffId: staffId,
          }),
    },
    select: {
      id: true,
      organizationId: true,
      studentId: true,
      assignedStaffId: true,
      status: true,
    },
  });
}

/**
 * Returns organization chat staff.
 */
export async function getOrganizationChatStaff(
  organizationId: string,
) {
  return db.chatStaff.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      organizationId: true,
      userId: true,
      position: true,
      status: true,
      lastSeenAt: true,
      lastActiveAt: true,
      canReply: true,
      canViewAllChats: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Returns a message in a specific conversation and organization.
 *
 * This is used before edit/delete operations so mutation handlers
 * cannot accidentally operate on another tenant's message.
 */
export async function getMessageForMutation(data: {
  messageId: string;
  conversationId: string;
  organizationId: string;
}) {
  return db.chatMessage.findFirst({
    where: {
      id: data.messageId,
      conversationId: data.conversationId,
      conversation: {
        organizationId: data.organizationId,
      },
    },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      isAIResponse: true,
      createdAt: true,
      updatedAt: true,
      editedAt: true,
      deletedAt: true,
    },
  });
}

/**
 * Edits a message.
 */
export async function updateMessage(data: {
  messageId: string;
  conversationId: string;
  organizationId: string;
  content: string;
}) {
  const message = await getMessageForMutation({
    messageId: data.messageId,
    conversationId: data.conversationId,
    organizationId: data.organizationId,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.deletedAt) {
    throw new Error("Cannot edit a deleted message");
  }

  const content = normalizeMessageContent(data.content);

  return db.chatMessage.update({
    where: {
      id: message.id,
    },
    data: {
      content,
      editedAt: new Date(),
    },
    include: messageInclude,
  });
}

/**
 * Soft-deletes a message.
 *
 * Attachments are intentionally retained in the database so
 * storage cleanup can be handled separately without losing
 * audit information.
 */
export async function softDeleteMessage(data: {
  messageId: string;
  conversationId: string;
  organizationId: string;
}) {
  const message = await getMessageForMutation({
    messageId: data.messageId,
    conversationId: data.conversationId,
    organizationId: data.organizationId,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.deletedAt) {
    throw new Error("Message already deleted");
  }

  return db.chatMessage.update({
    where: {
      id: message.id,
    },
    data: {
      deletedAt: new Date(),
      content: "",
      editedAt: null,
    },
    include: messageInclude,
  });
}

/**
 * Paginated conversation history.
 *
 * This is the important scalability addition for the WhatsApp-style
 * chat interface.
 *
 * Messages are returned newest-first internally so cursor pagination
 * remains stable. The UI can reverse the returned array if it needs
 * chronological rendering.
 */
export async function getConversationMessagesPage(data: {
  conversationId: string;
  organizationId: string;
  limit?: number;
  cursor?: string;
}) {
  const conversation = await assertConversationInOrganization(
    data.conversationId,
    data.organizationId,
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const limit = Math.min(
    Math.max(data.limit ?? 50, 1),
    100,
  );

  const messages = await db.chatMessage.findMany({
    where: {
      conversationId: data.conversationId,
    },
    include: messageInclude,
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1,
    ...(data.cursor
      ? {
          cursor: {
            id: data.cursor,
          },
          skip: 1,
        }
      : {}),
  });

  const hasMore = messages.length > limit;

  if (hasMore) {
    messages.pop();
  }

  const nextCursor = hasMore
    ? messages[messages.length - 1]?.id ?? null
    : null;

  return {
    messages,
    nextCursor,
    hasMore,
  };
}

/**
 * Lightweight latest-message lookup.
 *
 * Useful for conversation previews, notifications, and realtime
 * reconciliation without loading the entire conversation.
 */
export async function getLatestConversationMessage(
  conversationId: string,
  organizationId: string,
) {
  return db.chatMessage.findFirst({
    where: {
      conversationId,
      conversation: {
        organizationId,
      },
    },
    include: messageInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Lightweight conversation existence check.
 */
export async function conversationExists(
  conversationId: string,
  organizationId: string,
) {
  const conversation = await db.chatConversation.findFirst({
    where: {
      id: conversationId,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(conversation);
}
