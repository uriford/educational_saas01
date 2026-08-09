import { auth } from "@/auth";

import {
  NotificationService,
} from "@/features/notifications/services/notification.service";

import NotificationList from "@/features/notifications/components/NotificationList";

export default async function NotificationsPage() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return null;
  }

  const notifications =
    await NotificationService.getUserNotifications(
      session.user.id,
      session.user.organizationId,
    );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Notifications
        </h1>

        <p className="text-sm text-muted-foreground">
          Stay updated with activity in your organization.
        </p>
      </div>

      <NotificationList
        notifications={notifications.map(
          (notification) => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            href: notification.href,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
          }),
        )}
      />
    </div>
  );
}