import { db } from "@/lib/db";

export class AnalyticsRepository {
  static async getOverview(organizationId: string, branchId?: string) {
    const baseWhere = {
      organizationId,
      ...(branchId ? { branchId } : {}),
    };

    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      graduatedStudents,

      totalTeachers,
      activeTeachers,
      inactiveTeachers,
      archivedTeachers,

      totalCourses,
      activeCourses,
      inactiveCourses,
      archivedCourses,

      totalAnnouncements,
      publishedAnnouncements,
      draftAnnouncements,
      scheduledAnnouncements,
      archivedAnnouncements,
    ] = await Promise.all([
      // STUDENTS
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

      db.student.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "INACTIVE",
        },
      }),

      db.student.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "GRADUATED",
        },
      }),

      // TEACHERS
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

      db.teacher.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "INACTIVE",
        },
      }),

      db.teacher.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "RESIGNED",
        },
      }),

      // COURSES
      // COURSES
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

      db.course.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "INACTIVE",
        },
      }),

      db.course.count({
        where: {
          ...baseWhere,
          deletedAt: null,
          status: "ARCHIVED",
        },
      }),

      // ANNOUNCEMENTS
      // ANNOUNCEMENTS
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

      db.announcement.count({
        where: {
          organizationId,
          ...(branchId ? { branchId } : {}),
          deletedAt: null,
          status: "DRAFT",
        },
      }),

      db.announcement.count({
        where: {
          organizationId,
          ...(branchId ? { branchId } : {}),
          deletedAt: null,
          status: "SCHEDULED",
        },
      }),

      db.announcement.count({
        where: {
          organizationId,
          ...(branchId ? { branchId } : {}),
          deletedAt: null,
          status: "ARCHIVED",
        },
      }),
    ]);

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        graduated: graduatedStudents,
      },

      teachers: {
        total: totalTeachers,
        active: activeTeachers,
        inactive: inactiveTeachers,
        archived: archivedTeachers,
      },

      courses: {
        total: totalCourses,
        active: activeCourses,
        inactive: inactiveCourses,
        archived: archivedCourses,
      },

      announcements: {
        total: totalAnnouncements,
        published: publishedAnnouncements,
        draft: draftAnnouncements,
        scheduled: scheduledAnnouncements,
        archived: archivedAnnouncements,
      },
    };
  }
}
