import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

import {
  getChatConversation,
} from "@/features/chat/services/chat.service";

import {
  getChatStaffByUserId,
  getStudentConversation,
  getStaffChatConversation,
} from "@/features/chat/repository/chat.repository";

import {
  SubscriptionService,
} from "@/features/subscriptions/services/subscription.service";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      conversationId: string;
    }>;
  },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
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

    const role = session.user.role;
    const organizationId =
      session.user.organizationId;

    /*
     * SUPER_ADMIN may not have a tenant organization.
     *
     * Chat conversations are tenant-scoped, therefore a
     * SUPER_ADMIN must explicitly operate inside an organization
     * context before accessing a tenant conversation.
     */
    if (!organizationId) {
      return NextResponse.json(
        {
          message: "Organization context required",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Subscription enforcement.
     *
     * SUPER_ADMIN is exempt inside SubscriptionService.
     */
    const hasAccess =
      await SubscriptionService.hasAccess(
        organizationId,
      );

    if (
      role !== "SUPER_ADMIN" &&
      !hasAccess
    ) {
      return NextResponse.json(
        {
          message: "Subscription inactive",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ========================================================
     * STUDENT
     * ========================================================
     *
     * IMPORTANT:
     *
     * session.user.id = User.id
     * ChatConversation.studentId = Student.id
     *
     * Never pass User.id directly as studentId.
     */
    if (role === "STUDENT") {
      const student =
        await db.student.findFirst({
          where: {
            userId: session.user.id,
            organizationId,
            deletedAt: null,
          },
          select: {
            id: true,
          },
        });

      if (!student) {
        return NextResponse.json(
          {
            message: "Student profile not found",
          },
          {
            status: 403,
          },
        );
      }

      const conversation =
        await getStudentConversation(
          conversationId,
          organizationId,
          student.id,
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
     * ========================================================
     * ORGANIZATION ADMIN / SUPER ADMIN
     * ========================================================
     */
    if (
      role === "ORGANIZATION_ADMIN" ||
      role === "SUPER_ADMIN"
    ) {
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
     * ========================================================
     * STAFF / BRANCH ADMIN
     * ========================================================
     *
     * Access is controlled by ChatStaff:
     *
     * canViewAllChats = true
     *     -> all organization conversations
     *
     * canViewAllChats = false
     *     -> assigned conversations only
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
  } catch (error) {
    console.error(
      "CHAT CONVERSATION GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Failed to load conversation",
      },
      {
        status: 500,
      },
    );
  }
}
