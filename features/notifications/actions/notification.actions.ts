"use server";

import { auth } from "@/auth";

import {
  NotificationService,
} from "../services/notification.service";

export async function markNotificationReadAction(
  id: string,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  await NotificationService.markRead(
    id,
    session.user.id,
    session.user.organizationId,
  );

  return {
    success: true,
    message: "Notification marked as read.",
  };
}

export async function markAllNotificationsReadAction() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  await NotificationService.markAllRead(
    session.user.id,
    session.user.organizationId,
  );

  return {
    success: true,
    message: "All notifications marked as read.",
  };
}

export async function deleteNotificationAction(
  id: string,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  await NotificationService.delete(
    id,
    session.user.id,
    session.user.organizationId,
  );

  return {
    success: true,
    message: "Notification deleted.",
  };
}