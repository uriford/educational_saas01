import "server-only";

import { db } from "@/lib/db";
import { ClassSessionService } from "@/features/class-sessions/services/class-session.service";

export interface StudentChatContext {
  student: {
    firstName: string;
    lastName: string | null;
  };

  enrollments: Array<{
    course: {
      code: string;
      name: string;
      description: string | null;
      duration: number | null;
      fee: string | null;
      startDate: string | null;
      endDate: string | null;
    };

    status: string;
    progress: number;
    enrolledAt: string;
    completedAt: string | null;

    lessons: {
      total: number;
      completed: number;
      remaining: number;
      completedLessons: string[];
      remainingLessons: string[];
    };

    scheduledClasses: Array<{
      title: string;
      description: string | null;
      startTime: string;
      endTime: string;
      room: string | null;
      status: string;
      teacher: {
        firstName: string;
        lastName: string | null;
      };
    }>;
  }>;
}

/**
 * Builds the authenticated student's own learning context.
 *
 * IMPORTANT:
 * studentId must come from the server-side conversation/student
 * relationship. It must never come from arbitrary user input.
 *
 * Only the student's own enrollments and lesson progress are exposed.
 */
export async function getStudentChatContext(
  organizationId: string,
  studentId: string,
): Promise<StudentChatContext> {
  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  const student = await db.student.findFirst({
    where: {
      id: studentId,
      organizationId,
      deletedAt: null,
    },
    select: {
      firstName: true,
      lastName: true,
      branchId: true,
      courseEnrollments: {
        where: {
          status: {
            not: "DROPPED",
          },
        },
        orderBy: {
          enrolledAt: "desc",
        },
        select: {
          courseId: true,
          status: true,
          progress: true,
          enrolledAt: true,
          completedAt: true,

          course: {
            select: {
              code: true,
              name: true,
              description: true,
              duration: true,
              fee: true,
              startDate: true,
              endDate: true,
            },
          },

          lessonProgress: {
            orderBy: {
              lesson: {
                order: "asc",
              },
            },
            select: {
              completed: true,
              lesson: {
                select: {
                  title: true,
                  order: true,
                  deletedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  /*
   * Fetch the authenticated student's class sessions using the
   * existing student-aware repository/service path.
   *
   * This keeps schedule access tied to the student's own active/
   * completed course enrollments instead of trusting user input.
   */
  const sessions = student.branchId
    ? await ClassSessionService.getStudentSessions(
        studentId,
        organizationId,
        student.branchId,
      )
    : [];

  const now = new Date();

  const upcomingSessions = sessions
    .filter(
      (session) =>
        session.startTime >= now &&
        session.status !== "CANCELLED",
    )
    .slice(0, 20);

  return {
    student: {
      firstName: student.firstName,
      lastName: student.lastName,
    },

    enrollments: student.courseEnrollments.map((enrollment) => {
      const activeLessonProgress =
        enrollment.lessonProgress.filter(
          (item) => item.lesson.deletedAt === null,
        );

      const completedLessons = activeLessonProgress
        .filter((item) => item.completed)
        .map((item) => item.lesson.title);

      const remainingLessons = activeLessonProgress
        .filter((item) => !item.completed)
        .map((item) => item.lesson.title);

      return {
        course: {
          code: enrollment.course.code,
          name: enrollment.course.name,
          description: enrollment.course.description,
          duration: enrollment.course.duration,
          fee: enrollment.course.fee?.toString() ?? null,
          startDate:
            enrollment.course.startDate?.toISOString() ?? null,
          endDate:
            enrollment.course.endDate?.toISOString() ?? null,
        },

        status: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        completedAt:
          enrollment.completedAt?.toISOString() ?? null,

        lessons: {
          total: activeLessonProgress.length,
          completed: completedLessons.length,
          remaining: remainingLessons.length,
          completedLessons,
          remainingLessons,
        },

        scheduledClasses: upcomingSessions
          .filter(
            (session) =>
              session.courseId === enrollment.courseId,
          )
          .map((session) => ({
            title: session.title,
            description: session.description,
            startTime: session.startTime.toISOString(),
            endTime: session.endTime.toISOString(),
            room: session.room,
            status: session.status,
            teacher: {
              firstName: session.teacher.firstName,
              lastName: session.teacher.lastName,
            },
          })),
      };
    }),
  };
}
