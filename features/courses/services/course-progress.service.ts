import { db } from "@/lib/db";

export type CourseProgressMode = "CLASSES" | "DURATION";

export type CourseProgressResult = {
  progress: number;
  mode: CourseProgressMode;
  completedClasses: number;
  totalClasses: number | null;
  completedDurationMinutes: number;
  totalDurationMinutes: number;
};

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function getDurationMinutes(
  startTime: Date,
  endTime: Date,
): number {
  const duration =
    (endTime.getTime() - startTime.getTime()) / 60000;

  return duration > 0 ? duration : 0;
}

function calculateDurationProgress(
  startDate: Date | null,
  endDate: Date | null,
): number {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = startDate.getTime();
  const end = endDate.getTime();
  const now = Date.now();

  if (end <= start) {
    return 0;
  }

  if (now <= start) {
    return 0;
  }

  if (now >= end) {
    return 100;
  }

  return clampProgress(
    ((now - start) / (end - start)) * 100,
  );
}

export class CourseProgressService {
  static async calculate(
    enrollmentId: string,
  ): Promise<CourseProgressResult> {
    const enrollment =
      await db.courseEnrollment.findUnique({
        where: {
          id: enrollmentId,
        },
        select: {
          courseId: true,
          course: {
            select: {
              totalClasses: true,
              duration: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      });

    if (!enrollment) {
      return {
        progress: 0,
        mode: "DURATION",
        completedClasses: 0,
        totalClasses: null,
        completedDurationMinutes: 0,
        totalDurationMinutes: 0,
      };
    }

    const sessions =
      await db.classSession.findMany({
        where: {
          courseId: enrollment.courseId,
          deletedAt: null,
          status: {
            in: [
              "SCHEDULED",
              "ONGOING",
              "COMPLETED",
            ],
          },
        },
        select: {
          startTime: true,
          endTime: true,
          status: true,
        },
      });

    const validSessions = sessions.filter(
      (session) =>
        session.endTime.getTime() >
        session.startTime.getTime(),
    );

    const totalDurationMinutes =
      validSessions.reduce(
        (total, session) =>
          total +
          getDurationMinutes(
            session.startTime,
            session.endTime,
          ),
        0,
      );

    const completedSessions =
      validSessions.filter(
        (session) =>
          session.status === "COMPLETED",
      );

    const completedClasses =
      completedSessions.length;

    const completedDurationMinutes =
      completedSessions.reduce(
        (total, session) =>
          total +
          getDurationMinutes(
            session.startTime,
            session.endTime,
          ),
        0,
      );

    /*
     * Explicit Total Classes mode.
     *
     * If the admin entered Total Classes, progress is:
     *
     * completed class sessions / configured total classes.
     */
    if (
      enrollment.course.totalClasses !== null &&
      enrollment.course.totalClasses !== undefined
    ) {
      const totalClasses =
        enrollment.course.totalClasses;

      return {
        progress:
          totalClasses > 0
            ? clampProgress(
                (completedClasses /
                  totalClasses) *
                  100,
              )
            : 0,
        mode: "CLASSES",
        completedClasses,
        totalClasses,
        completedDurationMinutes,
        totalDurationMinutes,
      };
    }

    /*
     * Duration mode.
     *
     * If Total Classes is blank, progress is based on the
     * calendar duration between course startDate and endDate.
     *
     * Lessons and individual class-session minutes do NOT
     * control course progress in this mode.
     */
    return {
      progress: calculateDurationProgress(
        enrollment.course.startDate,
        enrollment.course.endDate,
      ),
      mode: "DURATION",
      completedClasses,
      totalClasses: null,
      completedDurationMinutes,
      totalDurationMinutes,
    };
  }

  static async recalculateForCourse(
    courseId: string,
  ): Promise<void> {
    const enrollments =
      await db.courseEnrollment.findMany({
        where: {
          courseId,
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

    for (const enrollment of enrollments) {
      const result =
        await this.calculate(enrollment.id);

      /*
       * IMPORTANT:
       * Do not preserve an accidentally stale COMPLETED
       * status. The calculated progress is authoritative.
       */
      const nextStatus =
        result.progress >= 100
          ? "COMPLETED"
          : "ACTIVE";

      await db.courseEnrollment.update({
        where: {
          id: enrollment.id,
        },
        data: {
          progress: result.progress,
          status: nextStatus,
          completedAt:
            nextStatus === "COMPLETED"
              ? new Date()
              : null,
        },
      });
    }
  }
}
