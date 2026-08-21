import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { requireActiveOrganizationAccess } from "@/features/auth/authorization";
import { db } from "@/lib/db";
import {
  publishStaffPresence,
} from "@/features/chat/realtime/pusher.server";

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

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

    /*
     * Tenant authorization + subscription enforcement.
     *
     * The organization comes exclusively from the authenticated
     * session. No request body value can select another tenant.
     */
    await requireActiveOrganizationAccess(
      session.user.organizationId,
    );

    const body = await request.json().catch(() => ({}));

    const requestedStatus =
      body?.status === "ONLINE" ||
      body?.status === "OFFLINE" ||
      body?.status === "BUSY"
        ? body.status
        : null;

    if (!requestedStatus) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 },
      );
    }

    const staff = await db.chatStaff.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            session.user.organizationId,
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        canReply: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Chat staff record not found" },
        { status: 404 },
      );
    }

    const now = new Date();

    if (requestedStatus === "OFFLINE") {
      const updated =
        await db.chatStaff.update({
          where: {
            id: staff.id,
          },
          data: {
            status: "OFFLINE",
            lastSeenAt: now,
          },
          select: {
            status: true,
            lastSeenAt: true,
            lastActiveAt: true,
          },
        });

      try {
        await publishStaffPresence(
          session.user.organizationId,
          staff.id,
          {
            status: "OFFLINE",
            activityState: "OFFLINE",
            lastSeenAt: updated.lastSeenAt,
            lastActiveAt:
              updated.lastActiveAt,
          },
        );
      } catch (error) {
        console.error(
          "Failed to publish staff offline presence:",
          error,
        );
      }

      return NextResponse.json({
        success: true,
        status: "OFFLINE",
        activityState: "OFFLINE",
        lastSeenAt:
          updated.lastSeenAt?.toISOString() ??
          null,
      });
    }

    const active =
      body?.active === true ||
      (
        typeof body?.lastActiveAt === "string" &&
        now.getTime() -
          new Date(body.lastActiveAt).getTime() <=
          ACTIVE_WINDOW_MS
      );

    const lastActiveAt = active
      ? now
      : undefined;

    const updated = await db.chatStaff.update({
      where: {
        id: staff.id,
      },
      data: {
        status: requestedStatus,
        lastSeenAt: now,
        ...(lastActiveAt
          ? { lastActiveAt }
          : {}),
      },
      select: {
        status: true,
        lastSeenAt: true,
        lastActiveAt: true,
      },
    });

    const activityState =
      active
        ? "ACTIVE"
        : "AWAY";

    try {
      await publishStaffPresence(
        session.user.organizationId,
        staff.id,
        {
          status: updated.status,
          activityState,
          lastSeenAt:
            updated.lastSeenAt,
          lastActiveAt:
            updated.lastActiveAt,
        },
      );
    } catch (error) {
      console.error(
        "Failed to publish staff presence:",
        error,
      );
    }

    return NextResponse.json({
      success: true,
      status: updated.status,
      activityState,
      lastSeenAt:
        updated.lastSeenAt?.toISOString() ??
        null,
      lastActiveAt:
        updated.lastActiveAt?.toISOString() ??
        null,
    });
  } catch (error) {
    console.error(
      "CHAT STAFF PRESENCE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update staff presence",
      },
      { status: 500 },
    );
  }
}
