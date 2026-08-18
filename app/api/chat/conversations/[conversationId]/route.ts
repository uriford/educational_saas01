import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  getChatConversation,
} from "@/features/chat/services/chat.service";

import {
  getChatStaffByUserId,
  getStudentConversation,
  getStaffChatConversation,
} from "@/features/chat/repository/chat.repository";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      conversationId: string;
    }>;
  },
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { conversationId } = await params;

  const organizationId =
    session.user.organizationId;

  /*
   * Organization admins and super admins can
   * access every conversation in their organization.
   */
  const isOrganizationAdmin =
    session.user.role === "ORGANIZATION_ADMIN";

  const isSuperAdmin =
    session.user.role === "SUPER_ADMIN";

  /*
   * Students can only access their own conversation.
   */
  if (session.user.role === "STUDENT") {
    const conversation =
      await getStudentConversation(
        conversationId,
        organizationId,
        session.user.id,
      );

    if (!conversation) {
      return NextResponse.json(
        {
          message: "Conversation not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(conversation);
  }

  /*
   * Admins can access every conversation
   * belonging to their organization.
   */
  if (isOrganizationAdmin || isSuperAdmin) {
    const conversation =
      await getChatConversation(
        conversationId,
        organizationId,
      );

    if (!conversation) {
      return NextResponse.json(
        {
          message: "Conversation not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(conversation);
  }

  /*
   * Staff access is scoped by the ChatStaff record.
   *
   * canViewAllChats = true:
   *   all organization conversations.
   *
   * canViewAllChats = false:
   *   only assigned conversations.
   */
  const staff =
    await getChatStaffByUserId(
      organizationId,
      session.user.id,
    );

  if (!staff) {
    return NextResponse.json(
      {
        message: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  const authorizedConversation =
    await getStaffChatConversation(
      conversationId,
      organizationId,
      staff.id,
      staff.canViewAllChats,
    );

  if (!authorizedConversation) {
    return NextResponse.json(
      {
        message: "Conversation not found",
      },
      {
        status: 404,
      },
    );
  }

  const conversation =
    await getChatConversation(
      conversationId,
      organizationId,
    );

  if (!conversation) {
    return NextResponse.json(
      {
        message: "Conversation not found",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(conversation);
}
