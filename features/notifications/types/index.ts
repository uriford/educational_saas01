import type { NotificationType } from "@prisma/client";

export type CreateNotificationInput = {
  organizationId: string;
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  href?: string;
  dedupeKey?: string;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: Date;
};