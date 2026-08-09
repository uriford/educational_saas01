import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  NotificationService,
} from "@/features/notifications/services/notification.service";

export async function GET() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
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
}