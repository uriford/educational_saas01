import { AnnouncementRepository } from "../repository/announcement.repository";
import type {
  CreateAnnouncementRepositoryData,
  UpdateAnnouncementData,
} from "../types";

import { NotificationService } from "@/features/notifications/services/notification.service";
import { db } from "@/lib/db";

export class AnnouncementService {
  static async create(
    data: CreateAnnouncementRepositoryData & {
      createdById: string;
    },
  ) {
    try {
      const announcement =
        await AnnouncementRepository.create(data);

      // Only notify users when the announcement
      // is published immediately.
      if (data.status === "PUBLISHED") {
        const users = await db.user.findMany({
          where: {
            organizationId: data.organizationId,
            deletedAt: null,
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        });

        for (const user of users) {
          await NotificationService.create({
            organizationId: data.organizationId,
            userId: user.id,
            type: "ANNOUNCEMENT",
            title: "New announcement",
            message: `"${data.title}" is now available.`,
            href: `/announcements/${announcement.id}`,
          });
        }
      }

      return {
        success: true,
        message: "Announcement created successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to create announcement.",
      };
    }
  }

  static async getAll(
    organizationId: string,
    branchId?: string,
    search?: string,
    page = 1,
    limit = 10,
  ) {
    return AnnouncementRepository.findAll(
      organizationId,
      branchId,
      search,
      page,
      limit,
    );
  }

  static async getPublishedForStudent(
    organizationId: string,
    branchId: string,
    limit = 10,
  ) {
    return AnnouncementRepository.findPublishedForStudent(
      organizationId,
      branchId,
      limit,
    );
  }

  static async getById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return AnnouncementRepository.findById(
      id,
      organizationId,
      branchId,
    );
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string,
    data: UpdateAnnouncementData,
  ) {
    try {
      const result =
        await AnnouncementRepository.update(
          id,
          organizationId,
          branchId,
          data,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Announcement not found.",
        };
      }

      return {
        success: true,
        message: "Announcement updated successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to update announcement.",
      };
    }
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const result =
        await AnnouncementRepository.softDelete(
          id,
          organizationId,
          branchId,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Announcement not found.",
        };
      }

      return {
        success: true,
        message: "Announcement deleted successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to delete announcement.",
      };
    }
  }

static async getPublishedByIdForStudent(
    id: string,
    organizationId: string,
    branchId: string,
  ) {
    return AnnouncementRepository.findPublishedByIdForStudent(
      id,
      organizationId,
      branchId,
    );
  }

}
