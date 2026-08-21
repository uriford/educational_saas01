import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

import {
  publishChatMessageStatus,
} from "@/features/chat/realtime/pusher.server";

import {
  getChatStaffByUserId,
  getStaffChatConversation,
  getStudentConversation,
} from "@/features/chat/repository/chat.repository";

import {
  SubscriptionService,
} from "@/features/subscriptions/services/subscription.service";

type MessageStatus =
  | "DELIVERED"
  | "SEEN";

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

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const organizationId =
      session.user.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        {
          error: "Organization context required",
        },
        {
          status: 403,
        },
      );
    }

    const {
      conversationId,
      messageId,
    } = await params;

    /*
     * Subscription enforcement.
     */
    const hasAccess =
      await SubscriptionService.hasAccess(
        organizationId,
      );

    if (
      session.user.role !== "SUPER_ADMIN" &&
      !hasAccess
    ) {
      return NextResponse.json(
        {
          error: "Subscription inactive",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ========================================================
     * CONVERSATION AUTHORIZATION
     * ========================================================
     */

    let currentStudentId:
      | string
      | null = null;

    if (session.user.role === "STUDENT") {
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
            error:
              "Student profile not found",
          },
          {
            status: 403,
          },
        );
      }

      currentStudentId = student.id;

      const authorized =
        await getStudentConversation(
          conversationId,
          organizationId,
          currentStudentId,
        );

      if (!authorized) {
        return NextResponse.json(
          {
            error:
              "Conversation not found",
          },
          {
            status: 404,
          },
        );
      }
    } else if (
      session.user.role !==
        "ORGANIZATION_ADMIN" &&
      session.user.role !==
        "SUPER_ADMIN"
    ) {
      const staff =
        await getChatStaffByUserId(
          organizationId,
          session.user.id,
        );

      if (!staff) {
        return NextResponse.json(
          {
            error: "Forbidden",
          },
          {
            status: 403,
          },
        );
      }

      const authorized =
        await getStaffChatConversation(
          conversationId,
          organizationId,
          staff.id,
          staff.canViewAllChats,
        );

      if (!authorized) {
        return NextResponse.json(
          {
            error:
              "Conversation not found",
          },
          {
            status: 404,
          },
        );
      }
    }

    /*
     * ========================================================
     * LOAD CONVERSATION
     * ========================================================
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
          studentId: true,
          assignedStaffId: true,
        },
      });

    if (!conversation) {
      return NextResponse.json(
        {
          error: "Conversation not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * ========================================================
     * PARSE STATUS
     * ========================================================
     */
    const body =
      await request.json().catch(() => null);

    const status =
      body?.status as
        | MessageStatus
        | undefined;

    if (
      status !== "DELIVERED" &&
      status !== "SEEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid message status",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ========================================================
     * LOAD MESSAGE
     * ========================================================
     */
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
        {
          error: "Message not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * A sender cannot mark their own message
     * as delivered/seen.
     */
    if (
      message.senderId ===
      session.user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot update your own message status",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ========================================================
     * MONOTONIC STATUS
     *
     * SENT -> DELIVERED -> SEEN
     * ========================================================
     */
    const currentRank =
      message.status === "SEEN"
        ? 2
        : message.status === "DELIVERED"
          ? 1
          : 0;

    const requestedRank =
      status === "SEEN"
        ? 2
        : 1;

    if (
      requestedRank <= currentRank
    ) {
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
                deliveredAt:
                  now,
                seenAt: now,
              }
            : {
                status:
                  "DELIVERED",
                deliveredAt:
                  now,
              },
        select: {
          id: true,
          status: true,
          deliveredAt: true,
          seenAt: true,
        },
      });

    /*
     * Realtime broadcasting must never make
     * the database operation fail.
     */
    try {
      await publishChatMessageStatus(
        conversation.organizationId,
        conversation.id,
        {
          messageId: updated.id,
          status,
          deliveredAt:
            updated.deliveredAt,
          seenAt: updated.seenAt,
          updatedBy:
            session.user.id,
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
      "CHAT MESSAGE STATUS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update message status",
      },
      {
        status: 500,
      },
    );
  }
}
