import { db } from "@/lib/db";

import type {
  CreateNotificationInput,
} from "../types";

export class NotificationRepository {
  static async create(
    data: CreateNotificationInput,
  ) {
    return db.notification.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        type: data.type ?? "INFO",
        title: data.title,
        message: data.message,
        href: data.href,
      },
    });
  }

  static async findByUser(
    userId: string,
    organizationId: string,
  ) {
    return db.notification.findMany({
      where: {
        userId,
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
  }

  static async countUnread(
    userId: string,
    organizationId: string,
  ) {
    return db.notification.count({
      where: {
        userId,
        organizationId,
        isRead: false,
      },
    });
  }

  static async markRead(
    id: string,
    userId: string,
    organizationId: string,
  ) {
    return db.notification.updateMany({
      where: {
        id,
        userId,
        organizationId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async markAllRead(
    userId: string,
    organizationId: string,
  ) {
    return db.notification.updateMany({
      where: {
        userId,
        organizationId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async delete(
    id: string,
    userId: string,
    organizationId: string,
  ) {
    return db.notification.deleteMany({
      where: {
        id,
        userId,
        organizationId,
      },
    });
  }
}