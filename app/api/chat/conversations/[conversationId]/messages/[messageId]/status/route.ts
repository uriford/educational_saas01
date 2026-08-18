import { NextResponse } from "next/server";

import { publishChatMessageStatus } from "@/features/chat/realtime/pusher.server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

import {
  getChatStaffByUserId,
  getStaffChatConversation,
  getStudentConversation,
} from "@/features/chat/repository/chat.repository";

type MessageStatus = "DELIVERED" | "SEEN";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      conversationId: string;
      messageId: string;
    }>;
  },
) {
  try {
    const session = await auth();

    let currentStudentId: string | null = null;

    if (session?.user?.id) {
      const student = await db.student.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

      currentStudentId = student?.id ?? null;
    }

    if (
      !session?.user?.id ||
      !session.user.organizationId
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { conversationId, messageId } =
      await params;

    const organizationId =
      session.user.organizationId;

    /*
     * ========================================================
     * CONVERSATION ACCESS CONTROL
     * ========================================================
     *
     * A user may update message status only if they are
     * actually allowed to access the conversation.
     */

    const isOrganizationAdmin =
      session.user.role === "ORGANIZATION_ADMIN";

    const isSuperAdmin =
      session.user.role === "SUPER_ADMIN";

    if (session.user.role === "STUDENT") {
      /*
       * IMPORTANT:
       *
       * session.user.id is User.id.
       * ChatConversation.studentId stores Student.id.
       *
       * currentStudentId was resolved above from:
       * Student.userId = session.user.id
       *
       * Therefore the student-scoped repository lookup MUST
       * use currentStudentId, never session.user.id.
       */
      if (!currentStudentId) {
        return NextResponse.json(
          { error: "Student profile not found" },
          { status: 403 },
        );
      }

      const studentConversation =
        await getStudentConversation(
          conversationId,
          organizationId,
          currentStudentId,
        );

      if (!studentConversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
    } else if (
      !isOrganizationAdmin &&
      !isSuperAdmin
    ) {
      const staff =
        await getChatStaffByUserId(
          organizationId,
          session.user.id,
        );

      if (!staff) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 },
        );
      }

      const staffConversation =
        await getStaffChatConversation(
          conversationId,
          organizationId,
          staff.id,
          staff.canViewAllChats,
        );

      if (!staffConversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
    }

    const body =
      await request.json().catch(() => null);

    const status =
      body?.status as MessageStatus | undefined;

    if (
      status !== "DELIVERED" &&
      status !== "SEEN"
    ) {
      return NextResponse.json(
        { error: "Invalid message status" },
        { status: 400 },
      );
    }

    /*
     * Re-check conversation ownership directly against
     * the organization before touching the message.
     */
    const conversation =
      await db.chatConversation.findFirst({
        where: {
          id: conversationId,
          organizationId,
        },
        select: {
          id: true,
          organizationId: true,
        },
      });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const message =
      await db.chatMessage.findFirst({
        where: {
          id: messageId,
          conversationId,
        },
        select: {
          id: true,
          senderId: true,
          status: true,
        },
      });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 },
      );
    }

    /*
     * Never allow a sender to mark their own message
     * as delivered/seen.
     */
    if (
      message.senderId === session.user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot update your own message status",
        },
        { status: 403 },
      );
    }

    const currentRank =
      message.status === "SEEN"
        ? 2
        : message.status === "DELIVERED"
          ? 1
          : 0;

    const requestedRank =
      status === "SEEN" ? 2 : 1;

    /*
     * Status is monotonic:
     *
     * SENT -> DELIVERED -> SEEN
     */
    if (requestedRank <= currentRank) {
      return NextResponse.json({
        success: true,
        status: message.status,
      });
    }

    const now = new Date();

    const updated =
      await db.chatMessage.update({
        where: {
          id: message.id,
        },
        data:
          status === "SEEN"
            ? {
                status: "SEEN",
                deliveredAt: now,
                seenAt: now,
              }
            : {
                status: "DELIVERED",
                deliveredAt: now,
              },
        select: {
          id: true,
          status: true,
          deliveredAt: true,
          seenAt: true,
        },
      });

    try {
      await publishChatMessageStatus(
        conversation.organizationId,
        conversation.id,
        {
          messageId: updated.id,
          status,
          deliveredAt: updated.deliveredAt,
          seenAt: updated.seenAt,
          updatedBy: session.user.id,
        },
      );
    } catch (realtimeError) {
      console.error(
        "Pusher status broadcast failed:",
        realtimeError,
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(
      "Chat message status error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update message status",
      },
      { status: 500 },
    );
  }
}
