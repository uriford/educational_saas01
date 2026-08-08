import { db } from "@/lib/db";

export class CourseSchedulerService {
  static async syncCourseStatuses() {
    const now = new Date();

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
    const archivedBeforeActivation = await db.course.updateMany({
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
        archivedBeforeActivation.count + archived.count,
    };
  }
}