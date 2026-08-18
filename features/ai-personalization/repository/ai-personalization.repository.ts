import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export class AIPersonalizationRepository {
  static async getStudentCourseData(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId: string,
  ) {
    const enrollment =
      await db.courseEnrollment.findFirst({
        where: {
          studentId,
          courseId,
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },

          student: {
            organizationId,
            branchId,
          },

          course: {
            organizationId,
            branchId,
          },
        },

        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },

          course: {
            select: {
              id: true,
              name: true,
              code: true,
              description: true,
            },
          },

          lessonProgress: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  type: true,
                  order: true,
                  duration: true,
                },
              },
            },

            orderBy: {
              lesson: {
                order: "asc",
              },
            },
          },
        },
      });

    if (!enrollment) {
      return null;
    }

    const lessons =
      await db.lesson.findMany({
        where: {
          courseId,
          status: "PUBLISHED",
          deletedAt: null,

          course: {
            organizationId,
            branchId,
          },
        },

        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          order: true,
          duration: true,
        },

        orderBy: {
          order: "asc",
        },
      });

    const submissions =
      await db.assessmentSubmission.findMany({
        where: {
          studentId,

          assessment: {
            courseId,
            deletedAt: null,
            organizationId,
            branchId,
          },

          status: {
            in: ["SUBMITTED", "GRADED"],
          },
        },

        include: {
          assessment: {
            select: {
              id: true,
              title: true,
              totalMarks: true,
              passingMarks: true,
            },
          },

          answers: {
            include: {
              question: {
                select: {
                  id: true,
                  question: true,
                  type: true,
                  marks: true,
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return {
      enrollment,
      lessons,
      submissions,
    };
  }

  static async get(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId: string,
  ) {
    return db.aIPersonalization.findFirst({
      where: {
        studentId,
        courseId,

        student: {
          organizationId,
          branchId,
        },

        course: {
          organizationId,
          branchId,
        },
      },
    });
  }

  static async upsert(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId: string,
    data: {
      learningLevel?: string;
      strengths?: Prisma.InputJsonValue;
      knowledgeGaps?: Prisma.InputJsonValue;
      recommendations?: Prisma.InputJsonValue;
      summary?: string;
      nextAction?: string;
    },
  ) {
    /*
     * Verify tenant ownership before writing.
     *
     * This prevents a personalization record from being
     * generated for a student/course pair outside the
     * current organization + branch context.
     */
    const enrollment =
      await db.courseEnrollment.findFirst({
        where: {
          studentId,
          courseId,

          student: {
            organizationId,
            branchId,
          },

          course: {
            organizationId,
            branchId,
          },
        },

        select: {
          id: true,
        },
      });

    if (!enrollment) {
      throw new Error(
        "Student course access could not be verified.",
      );
    }

    return db.aIPersonalization.upsert({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },

      create: {
        studentId,
        courseId,
        ...data,
      },

      update: {
        ...data,
        generatedAt: new Date(),
      },
    });
  }
}
