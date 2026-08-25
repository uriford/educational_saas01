import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export class LessonProgressRepository {
  static async findEnrollmentForStudent(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId,
        student: {
          organizationId,
          ...(branchId && { branchId }),
          deletedAt: null,
        },
        course: {
          organizationId,
          ...(branchId && { branchId }),
          deletedAt: null,
        },
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
      include: {
        course: true,
        student: true,
      },
    });
  }

  static async findPublishedLessons(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.lesson.findMany({
      where: {
        courseId,
        organizationId,
        ...(branchId && { branchId }),
        status: "PUBLISHED",
        deletedAt: null,
      },
      include: {
        resources: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: [
        {
          order: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });
  }

  static async findPublishedLesson(
    lessonId: string,
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
        organizationId,
        ...(branchId && { branchId }),
        status: "PUBLISHED",
        deletedAt: null,
      },
      include: {
        resources: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  static async findEnrollmentProgress(enrollmentId: string) {
    return db.lessonProgress.findMany({
      where: {
        enrollmentId,
      },
      orderBy: {
        lesson: {
          order: "asc",
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            order: true,
            type: true,
          },
        },
      },
    });
  }

  static async findLessonProgress(enrollmentId: string, lessonId: string) {
    return db.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
    });
  }

  static async markViewed(enrollmentId: string, lessonId: string) {
    return db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      create: {
        enrollmentId,
        lessonId,
        lastViewedAt: new Date(),
      },
      update: {
        lastViewedAt: new Date(),
      },
    });
  }

  static async markCompleted(
    enrollmentId: string,
    lessonId: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      create: {
        enrollmentId,
        lessonId,
        completed: true,
        lastViewedAt: new Date(),
        completedAt: new Date(),
      },
      update: {
        completed: true,
        lastViewedAt: new Date(),
        completedAt: new Date(),
      },
    });
  }

  static async countPublishedLessons(
    courseId: string,
    organizationId: string,
    branchId?: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.lesson.count({
      where: {
        courseId,
        organizationId,
        ...(branchId && { branchId }),
        status: "PUBLISHED",
        deletedAt: null,
      },
    });
  }

  static async countCompletedLessons(
    enrollmentId: string,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.lessonProgress.count({
      where: {
        enrollmentId,
        completed: true,
        lesson: {
          status: "PUBLISHED",
          deletedAt: null,
        },
      },
    });
  }

  static async updateEnrollmentProgress(
    enrollmentId: string,
    progress: number,
    tx: Prisma.TransactionClient = db,
  ) {
    const normalizedProgress = Math.min(
      100,
      Math.max(0, Math.round(progress)),
    );

    return tx.courseEnrollment.update({
      where: {
        id: enrollmentId,
      },
      data: {
        progress: normalizedProgress,
        status:
          normalizedProgress >= 100
            ? "COMPLETED"
            : "ACTIVE",
        completedAt:
          normalizedProgress >= 100
            ? new Date()
            : null,
      },
    });
  }
}
