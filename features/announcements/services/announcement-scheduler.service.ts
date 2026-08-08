import { db } from "@/lib/db";

export class AnnouncementSchedulerService {
  static async syncAnnouncementStatuses() {
    const now = new Date();

    // SCHEDULED → PUBLISHED
    await db.announcement.updateMany({
      where: {
        deletedAt: null,
        status: "SCHEDULED",
        publishAt: {
          lte: now,
        },
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gt: now,
            },
          },
        ],
      },
      data: {
        status: "PUBLISHED",
      },
    });

    // PUBLISHED → ARCHIVED
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
  }
}