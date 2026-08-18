import { db } from "@/lib/db";

export class DashboardService {
  static async getRecentActivity(
    organizationId: string,
    branchId?: string,
  ) {
    return db.auditLog.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  static async getUpcomingClasses(
    organizationId: string,
    branchId?: string,
  ) {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await db.classSession.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        deletedAt: null,
        startTime: {
          gte: now > startOfDay ? now : startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["SCHEDULED", "ONGOING"],
        },
      },
      orderBy: {
        startTime: "asc",
      },
      take: 5,
      include: {
        course: {
          select: {
            code: true,
            name: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      title: session.title,
      startTime: session.startTime,
      endTime: session.endTime,
      room: session.room,
      status:
        session.status === "ONGOING"
          ? ("ONGOING" as const)
          : ("SCHEDULED" as const),
      course: session.course,
      teacher: session.teacher,
    }));
  }

  static async getRecentAnnouncements(
    organizationId: string,
    branchId?: string,
  ) {
    const announcements = await db.announcement.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        deletedAt: null,
        status: "PUBLISHED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    return announcements;
  }

}
