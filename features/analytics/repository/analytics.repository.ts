import { db } from "@/lib/db";

export class AnalyticsRepository {
  static async getOverview(
    organizationId: string,
    branchId?: string,
  ) {
    const baseWhere = {
      organizationId,
      ...(branchId ? { branchId } : {}),
    };

    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalCourses,
      activeCourses,
      totalAnnouncements,
      publishedAnnouncements,
    ] = await Promise.all([
      db.student.count({
        where: {
          ...baseWhere,
          deletedAt: null,
        },
      }),

      db.student.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "ACTIVE",
        },
      }),

      db.teacher.count({
        where: {
          ...baseWhere,
          deletedAt: null,
        },
      }),

      db.teacher.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "ACTIVE",
        },
      }),

      db.course.count({
        where: {
          ...baseWhere,
          deletedAt: null,
        },
      }),

      db.course.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "ACTIVE",
        },
      }),

      db.announcement.count({
        where: {
          organizationId,
          ...(branchId ? { branchId } : {}),
          deletedAt: null,
        },
      }),

      db.announcement.count({
        where: {
          organizationId,
          ...(branchId ? { branchId } : {}),
          deletedAt: null,
          status: "PUBLISHED",
        },
      }),
    ]);

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
      },

      teachers: {
        total: totalTeachers,
        active: activeTeachers,
      },

      courses: {
        total: totalCourses,
        active: activeCourses,
      },

      announcements: {
        total: totalAnnouncements,
        published: publishedAnnouncements,
      },
    };
  }
}