"use server";

import { auth } from "@/auth";

import {
  SubscriptionService,
} from "@/features/subscriptions/services/subscription.service";
import { ROLES } from "@/features/auth/roles";
import { GuardianService } from "@/features/guardian-portal/services/guardian.service";
import { StudentService } from "@/features/students/services/student.service";
import { db } from "@/lib/db";


import {
  startChatConversation,
  sendChatMessage,
  getChatInbox,
  getStudentChatConversation,
  generateAIChatReply,
  shouldUseAIChatFallback,
  getChatConversation,
} from "../services/chat.service";

import {
  getChatStaffByUserId,
  getStaffChatConversation,
  toggleMessageReaction,
  getMessageForMutation,
  updateMessage,
  softDeleteMessage,
} from "../repository/chat.repository";

import {
  publishChatMessageReaction,
  publishChatMessageUpdated,
  publishChatMessageDeleted,
} from "../realtime/pusher.server";

export async function startGuardianConversationAction(data: {
  organizationId: string;
  studentId: string;
}) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      !session.user.organizationId ||
      session.user.organizationId !== data.organizationId ||
      session.user.role !== ROLES.GUARDIAN
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const child = await GuardianService.getChild(
      session.user.id,
      data.organizationId,
      data.studentId,
    );

    if (!child) {
      return {
        success: false,
        error: "Student is not linked to this guardian",
      };
    }

    if (!child.userId) {
      return {
        success: false,
        error: "This student does not have a user account",
      };
    }

    const conversation = await startChatConversation({
      organizationId: data.organizationId,
      studentId: child.id,
    });

    return {
      success: true,
      data: conversation,
    };
  } catch (error) {
    console.error(
      "Start guardian chat conversation error:",
      error,
    );

    return {
      success: false,
      error: "Failed to start conversation",
    };
  }
}

export async function startConversationAction(data: {
  organizationId: string;
  studentId: string;
}) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      !session.user.organizationId ||
      session.user.organizationId !== data.organizationId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (session.user.role !== "STUDENT") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const student = await db.student.findFirst({
      where: {
        userId: session.user.id,
        organizationId: data.organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return {
        success: false,
        error: "Student profile not found",
      };
    }

    if (student.id !== data.studentId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const conversation = await startChatConversation({
      organizationId: data.organizationId,
      studentId: student.id,
    });

    return {
      success: true,
      data: conversation,
    };
  } catch (error) {
    console.error(
      "Start chat conversation error:",
      error,
    );

    return {
      success: false,
      error: "Failed to start conversation",
    };
  }
}

export async function sendMessageAction(data: {
  conversationId: string;
  senderId: string;
  content: string;
  files?: File[];
}) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      !session.user.organizationId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const content = data.content.trim();

    if (!content && !data.files?.length) {
      return {
        success: false,
        error: "Message cannot be empty",
      };
    }

    if (content.length > 5000) {
      return {
        success: false,
        error: "Message is too long",
      };
    }

    const organizationId =
      session.user.organizationId;

    if (session.user.role === "STUDENT") {
      const student = await db.student.findFirst({
        where: {
          userId: session.user.id,
          organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!student) {
        return {
          success: false,
          error: "Student profile not found",
        };
      }

      const conversation =
        await getStudentChatConversation(
          data.conversationId,
          organizationId,
          student.id,
        );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }
    } else if (session.user.role === ROLES.GUARDIAN) {
      /*
       * Guardian authorization:
       *
       * ChatConversation.studentId is the Student record ID,
       * not the User ID.
       *
       * First load the conversation inside the organization,
       * then verify that its student is actually linked to the
       * authenticated guardian.
       */
      const guardianConversation =
        await getChatConversation(
          data.conversationId,
          organizationId,
        );

      if (!guardianConversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }

      if (!guardianConversation.studentId) {
        return {
          success: false,
          error: "This conversation is not linked to a student",
        };
      }

      const guardianChild =
        await GuardianService.getChild(
          session.user.id,
          organizationId,
          guardianConversation.studentId,
        );

      if (!guardianChild) {
        return {
          success: false,
          error: "You are not authorized to access this conversation",
        };
      }

      if (guardianConversation.status === "CLOSED") {
        return {
          success: false,
          error: "This conversation is closed",
        };
      }
    } else if (
      session.user.role === "ORGANIZATION_ADMIN" ||
      session.user.role === "SUPER_ADMIN"
    ) {
      const conversation =
        await getChatConversation(
          data.conversationId,
          organizationId,
        );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }
    } else {
      /*
       * CHAT STAFF
       *
       * Staff authorization is based on the ChatStaff
       * record, not merely the user's role. This gives
       * the organization explicit control over:
       *
       * - canReply
       * - canViewAllChats
       * - assigned conversation access
       */
      const staff =
        await getChatStaffByUserId(
          organizationId,
          session.user.id,
        );

      if (!staff) {
        return {
          success: false,
          error: "You are not registered as chat staff",
        };
      }

      if (!staff.canReply) {
        return {
          success: false,
          error: "You are not allowed to reply to chats",
        };
      }

      const conversation =
        await getStaffChatConversation(
          data.conversationId,
          organizationId,
          staff.id,
          staff.canViewAllChats,
        );

      if (!conversation) {
        return {
          success: false,
          error: "You are not allowed to access this conversation",
        };
      }

      if (conversation.status === "CLOSED") {
        return {
          success: false,
          error: "This conversation is closed",
        };
      }
    }

    const message = await sendChatMessage({
      conversationId: data.conversationId,
      senderId: session.user.id,
      content,
      organizationId,
      files: data.files,
    });

    /*
     * HUMAN-FIRST CHAT
     *
     * The student's message is always saved first.
     * Gemini must only answer when no eligible human
     * staff member is available.
     *
     * Admin/staff messages NEVER trigger Gemini.
     */
    if (session.user.role === "STUDENT" || session.user.role === ROLES.GUARDIAN) {
      try {
        const useAI = await shouldUseAIChatFallback(
          organizationId,
        );

        if (useAI) {
          const aiMessage =
            await generateAIChatReply({
              conversationId: data.conversationId,
              organizationId,
              message: content,
            });

          return {
            success: true,
            data: {
              message,
              aiMessage,
            },
          };
        }
      } catch (aiError) {
        console.error(
          "AI fallback failed:",
          aiError,
        );
      }
    }

    return {
      success: true,
      data: {
        message,
        aiMessage: null,
      },
    };
  } catch (error) {
    console.error(
      "Send chat message error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send message",
    };
  }
}

export async function getChatInboxAction(
  organizationId: string,
) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      !session.user.organizationId ||
      session.user.organizationId !== organizationId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (
      session.user.role !== "ORGANIZATION_ADMIN"
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    
    
    const hasAccess =
      await SubscriptionService.hasAccess(
        session.user.organizationId,
      );

    if (!hasAccess) {
      return {
        success: false,
        error: "Subscription inactive",
      };
    }

const conversations =
      await getChatInbox(organizationId);

    return {
      success: true,
      data: conversations,
    };
  } catch (error) {
    console.error(
      "Get chat inbox error:",
      error,
    );

    return {
      success: false,
      error: "Failed to load chat inbox",
    };
  }
}


export async function toggleMessageReactionAction(data: {
  conversationId: string;
  messageId: string;
  emoji: string;
}) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      !session.user.organizationId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const emoji = data.emoji.trim();

    if (!emoji || emoji.length > 16) {
      return {
        success: false,
        error: "Invalid reaction",
      };
    }

    const organizationId =
      session.user.organizationId;

    /*
     * Verify that the authenticated user is actually
     * allowed to access this conversation.
     */
    if (session.user.role === "STUDENT") {
      const student = await db.student.findFirst({
        where: {
          userId: session.user.id,
          organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!student) {
        return {
          success: false,
          error: "Student profile not found",
        };
      }

      const conversation =
        await getStudentChatConversation(
          data.conversationId,
          organizationId,
          student.id,
        );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }
    } else if (session.user.role === ROLES.GUARDIAN) {
      const conversation =
        await getChatConversation(
          data.conversationId,
          organizationId,
        );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }

      if (!conversation.studentId) {
        return {
          success: false,
          error: "This conversation is not linked to a student",
        };
      }

      const child =
        await GuardianService.getChild(
          session.user.id,
          organizationId,
          conversation.studentId,
        );

      if (!child) {
        return {
          success: false,
          error: "You are not authorized to access this conversation",
        };
      }
    } else if (
      session.user.role === "ORGANIZATION_ADMIN" ||
      session.user.role === "SUPER_ADMIN"
    ) {
      const conversation =
        await getChatConversation(
          data.conversationId,
          organizationId,
        );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }
    } else {
      const staff =
        await getChatStaffByUserId(
          organizationId,
          session.user.id,
        );

      if (!staff) {
        return {
          success: false,
          error: "You are not registered as chat staff",
        };
      }

      if (!staff.canReply) {
        return {
          success: false,
          error: "You are not allowed to react to chats",
        };
      }

      const conversation =
        await getStaffChatConversation(
          data.conversationId,
          organizationId,
          staff.id,
          staff.canViewAllChats,
        );

      if (!conversation) {
        return {
          success: false,
          error: "Conversation not found",
        };
      }
    }

    const reaction =
      await toggleMessageReaction({
        messageId: data.messageId,
        userId: session.user.id,
        emoji,
        organizationId,
      });

    if (!reaction) {
      return {
        success: false,
        error: "Message not found",
      };
    }

    await publishChatMessageReaction(
      organizationId,
      data.conversationId,
      {
        messageId: data.messageId,
        reactions: reaction.reactions.map(
          (item) => ({
            id: item.id,
            messageId: item.messageId,
            userId: item.userId,
            emoji: item.emoji,
            createdAt:
              item.createdAt.toISOString(),
          }),
        ),
      },
    );

    return {
      success: true,
      data: {
        messageId: data.messageId,
        reactions: reaction.reactions.map(
          (item) => ({
            id: item.id,
            messageId: item.messageId,
            userId: item.userId,
            emoji: item.emoji,
            createdAt:
              item.createdAt.toISOString(),
          }),
        ),
      },
    };
  } catch (error) {
    console.error(
      "Toggle chat message reaction error:",
      error,
    );

    return {
      success: false,
      error: "Failed to update reaction",
    };
  }
}

async function authorizeMessageMutation(data: {
  conversationId: string;
  messageId: string;
  organizationId: string;
  userId: string;
}) {
  const message = await getMessageForMutation({
    messageId: data.messageId,
    conversationId: data.conversationId,
    organizationId: data.organizationId,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.senderId !== data.userId) {
    throw new Error(
      "You can only modify your own messages",
    );
  }

  if (message.isAIResponse) {
    throw new Error(
      "AI messages cannot be modified",
    );
  }

  if (message.deletedAt) {
    throw new Error("Message has already been deleted");
  }

  return message;
}

export async function editMessageAction(data: {
  conversationId: string;
  messageId: string;
  content: string;
}) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      !session.user.organizationId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const content = data.content.trim();

    if (!content) {
      return {
        success: false,
        error: "Message cannot be empty",
      };
    }

    if (content.length > 5000) {
      return {
        success: false,
        error: "Message is too long",
      };
    }

    const organizationId =
      session.user.organizationId;

    await authorizeMessageMutation({
      conversationId: data.conversationId,
      messageId: data.messageId,
      organizationId,
      userId: session.user.id,
    });

    const message = await updateMessage({
      messageId: data.messageId,
      conversationId: data.conversationId,
      organizationId,
      content,
    });

    await publishChatMessageUpdated(
      organizationId,
      data.conversationId,
      {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        editedAt: message.editedAt,
        updatedAt: message.updatedAt,
      },
    );

    return {
      success: true,
      data: message,
    };
  } catch (error) {
    console.error(
      "Edit chat message error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to edit message",
    };
  }
}

export async function deleteMessageAction(data: {
  conversationId: string;
  messageId: string;
}) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      !session.user.organizationId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const organizationId =
      session.user.organizationId;

    await authorizeMessageMutation({
      conversationId: data.conversationId,
      messageId: data.messageId,
      organizationId,
      userId: session.user.id,
    });

    const message = await softDeleteMessage({
      messageId: data.messageId,
      conversationId: data.conversationId,
      organizationId,
    });

    if (!message.deletedAt) {
      return {
        success: false,
        error: "Failed to delete message",
      };
    }

    await publishChatMessageDeleted(
      organizationId,
      data.conversationId,
      {
        messageId: message.id,
        deletedAt: message.deletedAt,
      },
    );

    return {
      success: true,
      data: {
        messageId: message.id,
        deletedAt: message.deletedAt,
      },
    };
  } catch (error) {
    console.error(
      "Delete chat message error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete message",
    };
  }
}
