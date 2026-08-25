import { db } from "@/lib/db";

export class CourseSchedulerService {
  static async syncCourseStatuses() {
    const now = new Date();

    /*
     * Finalize class sessions whose scheduled end time has passed.
     *
     * Only SCHEDULED and ONGOING sessions are eligible.
     * CANCELLED sessions must never become COMPLETED.
     */
    const completedSessions =
      await db.classSession.findMany({
        where: {
          deletedAt: null,
          status: {
            in: ["SCHEDULED", "ONGOING"],
          },
          endTime: {
            lte: now,
          },
        },
        select: {
          id: true,
          courseId: true,
        },
      });

    const affectedCourseIds = [
      ...new Set(
        completedSessions
          .map((session) => session.courseId)
          .filter(
            (courseId): courseId is string =>
              Boolean(courseId),
          ),
      ),
    ];

    if (completedSessions.length > 0) {
      await db.classSession.updateMany({
        where: {
          id: {
            in: completedSessions.map(
              (session) => session.id,
            ),
          },
          deletedAt: null,
          status: {
            in: ["SCHEDULED", "ONGOING"],
          },
          endTime: {
            lte: now,
          },
        },
        data: {
          status: "COMPLETED",
        },
      });

      /*
       * A completed class changes Total Classes progress.
       * Recalculate every affected course immediately.
       */
      const { CourseProgressService } =
        await import("./course-progress.service");

      for (const courseId of affectedCourseIds) {
        await CourseProgressService.recalculateForCourse(
          courseId,
        );
      }
    }

    // INACTIVE → ACTIVE
    // Course has started but has not ended yet.
    const activated = await db.course.updateMany({
      where: {
        deletedAt: null,
        status: "INACTIVE",
        startDate: {
          lte: now,
        },
        OR: [
          {
            endDate: null,
          },
          {
            endDate: {
              gt: now,
            },
          },
        ],
      },
      data: {
        status: "ACTIVE",
      },
    });

    // INACTIVE → ARCHIVED
    // Course started and has already ended before the scheduler ran.
    const archivedBeforeActivation =
      await db.course.updateMany({
        where: {
          deletedAt: null,
          status: "INACTIVE",
          startDate: {
            lte: now,
          },
          endDate: {
            lte: now,
          },
        },
        data: {
          status: "ARCHIVED",
        },
      });

    // ACTIVE → ARCHIVED
    // Course has reached its end date.
    const archived = await db.course.updateMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        endDate: {
          lte: now,
        },
      },
      data: {
        status: "ARCHIVED",
      },
    });

    return {
      activated: activated.count,
      archived:
        archivedBeforeActivation.count +
        archived.count,
      completedClassSessions:
        completedSessions.length,
      affectedCourses: affectedCourseIds.length,
    };
  }
}
