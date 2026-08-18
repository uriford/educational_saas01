"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import {
  assignConversationStaff,
  getConversationById,
  getOrganizationChatStaff,
} from "../repository/chat.repository";

import {
  publishConversationAssignment,
} from "../realtime/pusher.server";

async function getAuthorizedContext() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return null;
  }

  return session;
}

export async function claimConversationAction(
  conversationId: string,
) {
  try {
    const session = await getAuthorizedContext();

    if (!session) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    const organizationId =
      session.user.organizationId;

    const staff = await getOrganizationChatStaff(
      organizationId,
    );

    const currentStaff = staff.find(
      (member) =>
        member.userId === session.user.id,
    );

    if (!currentStaff) {
      return {
        success: false,
        message: "You are not registered as chat staff.",
      };
    }

    if (!currentStaff.canReply) {
      return {
        success: false,
        message: "You are not allowed to reply to chats.",
      };
    }

    const now = Date.now();

    const recentlySeen =
      currentStaff.lastSeenAt &&
      now -
        currentStaff.lastSeenAt.getTime() <=
        90 * 1000;

    const recentlyActive =
      currentStaff.lastActiveAt &&
      now -
        currentStaff.lastActiveAt.getTime() <=
        2 * 60 * 1000;

    if (
      currentStaff.status !== "ONLINE" ||
      !recentlySeen ||
      !recentlyActive
    ) {
      return {
        success: false,
        message:
          "You must be actively online to claim a conversation.",
      };
    }

    const conversation =
      await getConversationById(
        conversationId,
        organizationId,
      );

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found.",
      };
    }

    if (
      conversation.assignedStaffId &&
      conversation.assignedStaffId !== currentStaff.id
    ) {
      return {
        success: false,
        message: "This conversation is already assigned.",
      };
    }

    const updated =
      await assignConversationStaff(
        conversationId,
        organizationId,
        currentStaff.id,
      );

    try {
      await publishConversationAssignment(
        organizationId,
        conversationId,
        {
          assignedStaffId: currentStaff.id,
        },
      );
    } catch (error) {
      console.error(
        "Failed to publish conversation assignment:",
        error,
      );
    }

    return {
      success: true,
      message: "Conversation claimed successfully.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "CLAIM CONVERSATION ERROR:",
      error,
    );

    return {
      success: false,
      message: "Failed to claim conversation.",
    };
  }
}

export async function assignConversationAction(data: {
  conversationId: string;
  staffId: string;
}) {
  try {
    const session = await getAuthorizedContext();

    if (!session) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    if (
      session.user.role !== ROLES.ORGANIZATION_ADMIN &&
      session.user.role !== ROLES.SUPER_ADMIN
    ) {
      return {
        success: false,
        message: "You are not allowed to assign conversations.",
      };
    }

    const organizationId =
      session.user.organizationId;

    const conversation =
      await getConversationById(
        data.conversationId,
        organizationId,
      );

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found.",
      };
    }

    const staff = await getOrganizationChatStaff(
      organizationId,
    );

    const targetStaff = staff.find(
      (member) =>
        member.id === data.staffId,
    );

    if (!targetStaff) {
      return {
        success: false,
        message: "Chat staff member not found.",
      };
    }

    if (!targetStaff.canReply) {
      return {
        success: false,
        message: "This staff member cannot reply to chats.",
      };
    }

    const now = Date.now();

    const recentlySeen =
      targetStaff.lastSeenAt &&
      now -
        targetStaff.lastSeenAt.getTime() <=
        90 * 1000;

    const recentlyActive =
      targetStaff.lastActiveAt &&
      now -
        targetStaff.lastActiveAt.getTime() <=
        2 * 60 * 1000;

    if (
      targetStaff.status !== "ONLINE" ||
      !recentlySeen ||
      !recentlyActive
    ) {
      return {
        success: false,
        message:
          "This staff member is not currently active.",
      };
    }

    const updated =
      await assignConversationStaff(
        data.conversationId,
        organizationId,
        targetStaff.id,
      );

    try {
      await publishConversationAssignment(
        organizationId,
        data.conversationId,
        {
          assignedStaffId: targetStaff.id,
        },
      );
    } catch (error) {
      console.error(
        "Failed to publish conversation assignment:",
        error,
      );
    }

    return {
      success: true,
      message: "Conversation assigned successfully.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "ASSIGN CONVERSATION ERROR:",
      error,
    );

    return {
      success: false,
      message: "Failed to assign conversation.",
    };
  }
}

export async function unassignConversationAction(
  conversationId: string,
) {
  try {
    const session = await getAuthorizedContext();

    if (!session) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    if (
      session.user.role !== ROLES.ORGANIZATION_ADMIN &&
      session.user.role !== ROLES.SUPER_ADMIN
    ) {
      return {
        success: false,
        message: "You are not allowed to unassign conversations.",
      };
    }

    const organizationId =
      session.user.organizationId;

    const conversation =
      await getConversationById(
        conversationId,
        organizationId,
      );

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found.",
      };
    }

    const updated =
      await assignConversationStaff(
        conversationId,
        organizationId,
        null,
      );

    try {
      await publishConversationAssignment(
        organizationId,
        conversationId,
        {
          assignedStaffId: null,
        },
      );
    } catch (error) {
      console.error(
        "Failed to publish conversation unassignment:",
        error,
      );
    }

    return {
      success: true,
      message: "Conversation unassigned successfully.",
      data: updated,
    };
  } catch (error) {
    console.error(
      "UNASSIGN CONVERSATION ERROR:",
      error,
    );

    return {
      success: false,
      message: "Failed to unassign conversation.",
    };
  }
}
