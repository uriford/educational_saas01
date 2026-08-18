import { AnnouncementRepository } from "../repository/announcement.repository";
import type {
  CreateAnnouncementRepositoryData,
  UpdateAnnouncementData,
} from "../types";

import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";
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

      // Published announcements notify active non-admin users directly.
      // Administrators are handled by the scoped automation service.
      if (data.status === "PUBLISHED") {
        const students = await db.student.findMany({
          where: {
            organizationId: data.organizationId,
            ...(data.branchId
              ? {
                  branchId: data.branchId,
                }
              : {}),
            deletedAt: null,
            status: "ACTIVE",
            user: {
              is: {
                status: "ACTIVE",
                role: "STUDENT",
                deletedAt: null,
              },
            },
          },
          select: {
            id: true,
          },
        });

        for (const student of students) {
          await NotificationAutomationService.notifyStudent({
            studentId: student.id,
            organizationId: data.organizationId,
            type: "ANNOUNCEMENT",
            title: "New announcement",
            message: `"${data.title}" is now available.`,
            href: `/announcements/${announcement.id}`,
            dedupeKey:
              `announcement-student-published:${announcement.id}:${student.id}`,
          });
        }

        await NotificationAutomationService.notifyAdmins({
          organizationId: data.organizationId,
          branchId: data.branchId,
          actorId: data.createdById,
          type: "ANNOUNCEMENT",
          title: "Announcement published",
          message: `"${data.title}" was published.`,
          href: `/announcements/${announcement.id}`,
          dedupeKey:
            `announcement-admin-published:${announcement.id}`,
        });

        await db.auditLog.create({
          data: {
            organizationId: data.organizationId,
            branchId: data.branchId ?? null,
            userId: data.createdById,
            action: "CREATE",
            entityType: "Announcement",
            entityId: announcement.id,
            description:
              `Announcement "${data.title}" was published.`,
          },
        });
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
