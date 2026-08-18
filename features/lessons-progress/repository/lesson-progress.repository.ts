import { db } from "@/lib/db";

export class LessonProgressRepository {
  static async findEnrollmentForStudent(
    userId: string,
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.courseEnrollment.findFirst({
      where: {
        courseId,
        student: {
          userId,
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

  static async findEnrollmentProgress(
    enrollmentId: string,
  ) {
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

  static async findLessonProgress(
    enrollmentId: string,
    lessonId: string,
  ) {
    return db.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
    });
  }

  static async markViewed(
    enrollmentId: string,
    lessonId: string,
  ) {
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
  ) {
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
  ) {
    return db.lesson.count({
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
  ) {
    return db.lessonProgress.count({
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
  ) {
    return db.courseEnrollment.update({
      where: {
        id: enrollmentId,
      },
      data: {
        progress,
        ...(progress >= 100
          ? {
              status: "COMPLETED",
              completedAt: new Date(),
            }
          : {}),
      },
    });
  }
}
