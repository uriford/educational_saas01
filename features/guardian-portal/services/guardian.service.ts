import { db } from "@/lib/db";
import { StudentAttendanceRepository } from "@/features/attendance/repository/student-attendance.repository";

export class GuardianService {
  /**
   * Get the guardian profile belonging to the authenticated user.
   */
  static async getProfileByUserId(
    userId: string,
    organizationId: string,
  ) {
    return db.guardianProfile.findFirst({
      where: {
        userId,
        organizationId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        students: {
          include: {
            student: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  /**
   * Get only the students explicitly linked to this guardian.
   */
  static async getChildren(
    userId: string,
    organizationId: string,
  ) {
    const guardian = await db.guardianProfile.findFirst({
      where: {
        userId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!guardian) {
      return [];
    }

    return db.guardianStudent.findMany({
      where: {
        guardianId: guardian.id,
        student: {
          organizationId,
        },
      },
      include: {
        student: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Verify that a specific student actually belongs
   * to the authenticated guardian.
   */
  static async getChild(
    userId: string,
    organizationId: string,
    studentId: string,
  ) {
    const guardian = await db.guardianProfile.findFirst({
      where: {
        userId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!guardian) {
      return null;
    }

    const relation = await db.guardianStudent.findFirst({
      where: {
        guardianId: guardian.id,
        studentId,
        student: {
          organizationId,
        },
      },
      include: {
        student: true,
      },
    });

    return relation?.student ?? null;
  }

  /**
   * Get payment plans for a student explicitly linked
   * to the authenticated guardian.
   */
  static async getChildPayments(
    userId: string,
    organizationId: string,
    studentId: string,
  ) {
    const child = await this.getChild(
      userId,
      organizationId,
      studentId,
    );

    if (!child) {
      return null;
    }

    return db.paymentPlan.findMany({
      where: {
        organizationId,
        enrollment: {
          studentId: child.id,
        },
      },
      include: {
        enrollment: {
          include: {
            course: true,
          },
        },
        installments: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }


  /**
   * Get read-only learning progress for a student
   * explicitly linked to this guardian.
   */
  static async getChildProgress(
    userId: string,
    organizationId: string,
    studentId: string,
  ) {
    const child = await this.getChild(
      userId,
      organizationId,
      studentId,
    );

    if (!child) {
      return null;
    }

    const enrollments = await db.courseEnrollment.findMany({
      where: {
        studentId: child.id,
        course: {
          organizationId,
          deletedAt: null,
        },
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const lessons = await db.lesson.findMany({
          where: {
            courseId: enrollment.courseId,
            organizationId,
            status: "PUBLISHED",
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            order: true,
            type: true,
          },
          orderBy: [
            { order: "asc" },
            { createdAt: "asc" },
          ],
        });

        const progress = await db.lessonProgress.findMany({
          where: {
            enrollmentId: enrollment.id,
            lesson: {
              status: "PUBLISHED",
              deletedAt: null,
            },
          },
          select: {
            lessonId: true,
            completed: true,
            completedAt: true,
            lastViewedAt: true,
          },
        });

        const progressMap = new Map(
          progress.map((item) => [
            item.lessonId,
            item,
          ]),
        );

        const completedLessons = lessons.filter(
          (lesson) =>
            progressMap.get(lesson.id)?.completed === true,
        ).length;

        const totalLessons = lessons.length;

        const completionPercentage =
          totalLessons === 0
            ? 0
            : Math.round(
                (completedLessons / totalLessons) * 100,
              );

        return {
          enrollmentId: enrollment.id,
          status: enrollment.status,
          progress: completionPercentage,
          completedLessons,
          totalLessons,
          course: enrollment.course,
          lessons: lessons.map((lesson) => ({
            ...lesson,
            completed:
              progressMap.get(lesson.id)?.completed ?? false,
            completedAt:
              progressMap.get(lesson.id)?.completedAt ?? null,
            lastViewedAt:
              progressMap.get(lesson.id)?.lastViewedAt ?? null,
          })),
        };
      }),
    );

    return {
      student: {
        id: child.id,
        studentId: child.studentId,
        name: `${child.firstName} ${child.lastName ?? ""}`.trim(),
      },
      courses,
    };
  }

  /**
   * Get read-only class schedule for a student
   * explicitly linked to this guardian.
   */
  static async getChildSchedule(
    userId: string,
    organizationId: string,
    studentId: string,
  ) {
    const child = await this.getChild(
      userId,
      organizationId,
      studentId,
    );

    if (!child) {
      return null;
    }

    if (!child.branchId) {
      return {
        student: {
          id: child.id,
          studentId: child.studentId,
          name: `${child.firstName} ${child.lastName ?? ""}`.trim(),
        },
        sessions: [],
      };
    }

    const sessions = await db.classSession.findMany({
      where: {
        organizationId,
        branchId: child.branchId,
        deletedAt: null,
        status: {
          not: "CANCELLED",
        },
        course: {
          deletedAt: null,
          enrollments: {
            some: {
              studentId: child.id,
              status: {
                in: ["ACTIVE", "COMPLETED"],
              },
            },
          },
        },
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            teacherId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return {
      student: {
        id: child.id,
        studentId: child.studentId,
        name: `${child.firstName} ${child.lastName ?? ""}`.trim(),
      },
      sessions: sessions.map((session) => ({
        id: session.id,
        title: session.title,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        room: session.room,
        status: session.status,
        course: {
          id: session.course.id,
          code: session.course.code,
          name: session.course.name,
        },
        teacher: {
          id: session.teacher.id,
          teacherId: session.teacher.teacherId,
          firstName: session.teacher.firstName,
          lastName: session.teacher.lastName,
        },
      })),
    };
  }

  /**
   * Get a consolidated read-only academic report for a student
   * explicitly linked to this guardian.
   *
   * This combines:
   * - assessment results
   * - attendance
   * - learning progress
   *
   * Guardian access is always verified through getChild().
   */
  static async getChildReport(
    userId: string,
    organizationId: string,
    studentId: string,
  ) {
    const child = await this.getChild(
      userId,
      organizationId,
      studentId,
    );

    if (!child) {
      return null;
    }

    const [attendance, progress] = await Promise.all([
      this.getChildAttendance(
        userId,
        organizationId,
        studentId,
      ),
      this.getChildProgress(
        userId,
        organizationId,
        studentId,
      ),
    ]);

    const { ResultService } = await import(
      "@/features/results/services/result.service"
    );

    const resultData = await ResultService.getStudentResults({
      studentId: child.id,
      organizationId,
    });

    const results = resultData.success
      ? resultData.results ?? []
      : [];

    const summary = resultData.success
      ? resultData.summary
      : {
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0,
          averagePercentage: 0,
        };

    const progressCourses = progress?.courses ?? [];

    const averageProgress =
      progressCourses.length > 0
        ? Math.round(
            progressCourses.reduce(
              (total, course) => total + course.progress,
              0,
            ) / progressCourses.length,
          )
        : 0;

    return {
      student: {
        id: child.id,
        studentId: child.studentId,
        name: `${child.firstName} ${child.lastName ?? ""}`.trim(),
        email: child.email,
        status: child.status,
      },

      results: {
        items: results,
        summary,
      },

      attendance,

      progress: {
        courses: progressCourses,
        averageProgress,
      },

      generatedAt: new Date(),
    };
  }

  /**
   * Get read-only attendance for a student
   * explicitly linked to this guardian.
   */
  static async getChildAttendance(
    userId: string,
    organizationId: string,
    studentId: string,
  ) {
    const child = await this.getChild(
      userId,
      organizationId,
      studentId,
    );

    if (!child) {
      return null;
    }

    return StudentAttendanceRepository.getReport(
      organizationId,
      child.id,
      undefined,
    );
  }

}
