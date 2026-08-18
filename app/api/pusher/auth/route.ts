import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  authenticatePusherChannel,
} from "@/features/chat/realtime/pusher.server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      !session.user.organizationId
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const contentType =
      request.headers.get("content-type") ?? "";

    let socketId = "";
    let channelName = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();

      socketId =
        typeof body?.socket_id === "string"
          ? body.socket_id
          : "";

      channelName =
        typeof body?.channel_name === "string"
          ? body.channel_name
          : "";
    } else {
      const body = await request.text();
      const params = new URLSearchParams(body);

      socketId =
        params.get("socket_id") ?? "";

      channelName =
        params.get("channel_name") ?? "";
    }

    if (!socketId || !channelName) {
      return NextResponse.json(
        {
          error:
            "socket_id and channel_name are required",
        },
        { status: 400 },
      );
    }

    const organizationId =
      session.user.organizationId;

    const privatePrefix =
      `private-chat-${organizationId}-`;

    const presencePrefix =
      `presence-chat-${organizationId}-`;

    const staffChannel =
      `private-staff-${organizationId}`;

    const isPrivateChannel =
      channelName.startsWith(privatePrefix);

    const isPresenceChannel =
      channelName.startsWith(presencePrefix);

    const isStaffChannel =
      channelName === staffChannel;

    /*
     * Only these three channel families belong to
     * this organization's chat system.
     */
    if (
      !isPrivateChannel &&
      !isPresenceChannel &&
      !isStaffChannel
    ) {
      return NextResponse.json(
        { error: "Channel access denied" },
        { status: 403 },
      );
    }

    /*
     * STAFF CHANNEL
     *
     * This channel does not contain a conversation ID.
     * Therefore it MUST NOT go through conversation lookup.
     */
    if (isStaffChannel) {
      const isOrganizationAdmin =
        session.user.role === "ORGANIZATION_ADMIN";

      const isSuperAdmin =
        session.user.role === "SUPER_ADMIN";

      let isStaff = false;

      if (!isOrganizationAdmin && !isSuperAdmin) {
        const staff =
          await db.chatStaff.findUnique({
            where: {
              organizationId_userId: {
                organizationId,
                userId: session.user.id,
              },
            },
            select: {
              id: true,
            },
          });

        isStaff = Boolean(staff);
      }

      if (
        !isOrganizationAdmin &&
        !isSuperAdmin &&
        !isStaff
      ) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 },
        );
      }

      const userName =
        [
          session.user.firstName,
          session.user.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        session.user.name ||
        "User";

      const userImage =
        typeof session.user.image === "string"
          ? session.user.image
          : null;

      const authResponse =
        await authenticatePusherChannel(
          socketId,
          channelName,
          session.user.id,
          userName,
          userImage,
        );

      return NextResponse.json(authResponse);
    }

    /*
     * PRIVATE / PRESENCE CHANNELS
     *
     * Both contain a conversation ID.
     */
    const channelPrefix = isPrivateChannel
      ? privatePrefix
      : presencePrefix;

    const conversationId =
      channelName.slice(channelPrefix.length);

    if (!conversationId) {
      return NextResponse.json(
        {
          error:
            "Invalid conversation channel",
        },
        { status: 400 },
      );
    }

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
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const isOrganizationAdmin =
      session.user.role ===
      "ORGANIZATION_ADMIN";

    const isSuperAdmin =
      session.user.role ===
      "SUPER_ADMIN";

    /*
     * IMPORTANT:
     *
     * ChatConversation.studentId stores Student.id,
     * while session.user.id stores User.id.
     *
     * Resolve the Student record first.
     */
    let currentStudentId: string | null = null;

    if (session.user.role === "STUDENT") {
      const student =
        await db.student.findUnique({
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        });

      currentStudentId =
        student?.id ?? null;
    }

    const isStudent =
      session.user.role === "STUDENT" &&
      currentStudentId !== null &&
      currentStudentId === conversation.studentId;

    /*
     * STAFF ACCESS
     *
     * canViewAllChats => every conversation
     * assigned staff => assigned conversation
     */
    let isAuthorizedStaff = false;

    if (
      !isStudent &&
      !isOrganizationAdmin &&
      !isSuperAdmin
    ) {
      const staff =
        await db.chatStaff.findUnique({
          where: {
            organizationId_userId: {
              organizationId,
              userId: session.user.id,
            },
          },
          select: {
            id: true,
            canReply: true,
            canViewAllChats: true,
          },
        });

      if (staff) {
        const isAssignedStaff =
          conversation.assignedStaffId === staff.id;

        isAuthorizedStaff =
          staff.canViewAllChats ||
          isAssignedStaff;
      }
    }

    if (
      !isOrganizationAdmin &&
      !isSuperAdmin &&
      !isStudent &&
      !isAuthorizedStaff
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const userName =
      [
        session.user.firstName,
        session.user.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      session.user.name ||
      "User";

    const userImage =
      typeof session.user.image === "string"
        ? session.user.image
        : null;

    const authResponse =
      await authenticatePusherChannel(
        socketId,
        channelName,
        session.user.id,
        userName,
        userImage,
      );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error(
      "Pusher authentication error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to authenticate Pusher channel",
      },
      { status: 500 },
    );
  }
}
