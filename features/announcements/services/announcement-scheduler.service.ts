import { db } from "@/lib/db";

export class AnnouncementSchedulerService {
  static async syncAnnouncementStatuses() {
    const now = new Date();

    const scheduledAnnouncements = await db.announcement.findMany({
      where: {
        deletedAt: null,
        status: "SCHEDULED",
        publishAt: {
          lte: now,
        },
      },
    });

    let publishedCount = 0;
    let notificationCount = 0;

    for (const announcement of scheduledAnnouncements) {
      await db.announcement.update({
        where: {
          id: announcement.id,
        },
        data: {
          status: "PUBLISHED",
        },
      });

      publishedCount++;

      const users = await db.user.findMany({
        where: {
          organizationId: announcement.organizationId,
          deletedAt: null,
          status: "ACTIVE",
          ...(announcement.branchId
            ? {
                branchId: announcement.branchId,
              }
            : {}),
        },
        select: {
          id: true,
        },
      });

      for (const user of users) {
        const existingNotification = await db.notification.findFirst({
          where: {
            userId: user.id,
            organizationId: announcement.organizationId,
            href: `/announcements/${announcement.id}`,
          },
        });

        if (!existingNotification) {
          await db.notification.create({
            data: {
              organizationId: announcement.organizationId,
              userId: user.id,
              type: "ANNOUNCEMENT",
              title: "New announcement",
              message: `"${announcement.title}" is now available.`,
              href: `/announcements/${announcement.id}`,
            },
          });

          notificationCount++;
        }
      }
    }

    await db.announcement.updateMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: "ARCHIVED",
      },
    });

    return {
      publishedCount,
      notificationCount,
    };
  }
}
