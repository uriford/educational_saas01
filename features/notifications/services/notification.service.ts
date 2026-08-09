import {
  NotificationRepository,
} from "../repository/notification.repository";

import type {
  CreateNotificationInput,
} from "../types";

export class NotificationService {
  static async create(
    data: CreateNotificationInput,
  ) {
    return NotificationRepository.create(data);
  }

  static async getUserNotifications(
    userId: string,
    organizationId: string,
  ) {
    return NotificationRepository.findByUser(
      userId,
      organizationId,
    );
  }

  static async getUnreadCount(
    userId: string,
    organizationId: string,
  ) {
    return NotificationRepository.countUnread(
      userId,
      organizationId,
    );
  }

  static async markRead(
    id: string,
    userId: string,
    organizationId: string,
  ) {
    return NotificationRepository.markRead(
      id,
      userId,
      organizationId,
    );
  }

  static async markAllRead(
    userId: string,
    organizationId: string,
  ) {
    return NotificationRepository.markAllRead(
      userId,
      organizationId,
    );
  }

  static async delete(
    id: string,
    userId: string,
    organizationId: string,
  ) {
    return NotificationRepository.delete(
      id,
      userId,
      organizationId,
    );
  }
}