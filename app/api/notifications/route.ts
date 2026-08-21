import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  NotificationService,
} from "@/features/notifications/services/notification.service";

import {
  SubscriptionService,
} from "@/features/subscriptions/services/subscription.service";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !session.user.organizationId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Organization context required",
        },
        {
          status: 403,
        },
      );
    }

    if (
      session.user.role !==
      "SUPER_ADMIN"
    ) {
      const hasAccess =
        await SubscriptionService.hasAccess(
          session.user.organizationId,
        );

      if (!hasAccess) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Subscription inactive",
          },
          {
            status: 403,
          },
        );
      }
    }

    const [
      notifications,
      unreadCount,
    ] = await Promise.all([
      NotificationService.getUserNotifications(
        session.user.id,
        session.user.organizationId,
      ),

      NotificationService.getUnreadCount(
        session.user.id,
        session.user.organizationId,
      ),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "NOTIFICATIONS API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load notifications.",
      },
      {
        status: 500,
      },
    );
  }
}
