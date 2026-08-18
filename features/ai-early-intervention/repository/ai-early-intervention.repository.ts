import { db } from "@/lib/db";

export class AIEarlyInterventionRepository {
  static async getLifetimeStudentData(
    studentId: string,
    organizationId: string,
    branchId: string,
  ) {
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        organizationId,
        branchId,
        deletedAt: null,
      },

      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        guardianEmail: true,
      },
    });

    if (!student) {
      return null;
    }

    const courseEnrollments =
      await db.courseEnrollment.findMany({
        where: {
          studentId,
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

        select: {
          id: true,
          courseId: true,
          progress: true,
          status: true,
          enrolledAt: true,
          completedAt: true,

          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },

          lessonProgress: {
            select: {
              id: true,
              lessonId: true,
              completed: true,
              lastViewedAt: true,
              completedAt: true,

              lesson: {
                select: {
                  id: true,
                  title: true,
                  order: true,
                },
              },
            },
          },
        },

        orderBy: {
          enrolledAt: "desc",
        },
      });

    const assessmentSubmissions =
      await db.assessmentSubmission.findMany({
        where: {
          studentId,

          assessment: {
            organizationId,
            branchId,
            deletedAt: null,
          },

          status: {
            in: ["SUBMITTED", "GRADED"],
          },
        },

        select: {
          id: true,
          score: true,
          percentage: true,
          status: true,
          createdAt: true,

          assessment: {
            select: {
              id: true,
              title: true,
              totalMarks: true,
              passingMarks: true,
            },
          },

          answers: {
            select: {
              marksAwarded: true,

              question: {
                select: {
                  id: true,
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

    const attendances =
      await db.attendance.findMany({
        where: {
          studentId,

          classSession: {
            organizationId,
            branchId,
            deletedAt: null,
          },
        },

        select: {
          id: true,
          status: true,

          classSession: {
            select: {
              id: true,
              courseId: true,
              title: true,
              startTime: true,
              endTime: true,
            },
          },
        },

        orderBy: {
          classSession: {
            startTime: "desc",
          },
        },
      });

    return {
      ...student,
      courseEnrollments,
      assessmentSubmissions,
      attendances,
    };
  }

  static async get(
    studentId: string,
    organizationId: string,
    branchId: string,
  ) {
    return db.aIEarlyIntervention.findFirst({
      where: {
        studentId,
        organizationId,
        branchId,
      },

      include: {
        interventionLogs: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  static async upsert(
    studentId: string,
    organizationId: string,
    branchId: string,
    data: {
      riskScore: number;
      riskLevel:
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "CRITICAL";
      reasons: object;
      recommendedActions: object;
      summary: string;
      nextAction: string;
    },
  ) {
    const student =
      await db.student.findFirst({
        where: {
          id: studentId,
          organizationId,
          branchId,
          deletedAt: null,
        },

        select: {
          id: true,
        },
      });

    if (!student) {
      throw new Error(
        "Student access could not be verified.",
      );
    }

    return db.aIEarlyIntervention.upsert({
      where: {
        studentId,
      },

      create: {
        studentId,
        organizationId,
        branchId,
        ...data,
      },

      update: {
        ...data,
        organizationId,
        branchId,
        lastAnalyzedAt: new Date(),
      },
    });
  }

  static async markNotificationSent(
    studentId: string,
    organizationId: string,
    branchId: string,
  ) {
    return db.aIEarlyIntervention.updateMany({
      where: {
        studentId,
        organizationId,
        branchId,
      },
      data: {
        lastNotificationAt: new Date(),
        notificationCount: {
          increment: 1,
        },
      },
    });
  }

  static async createInterventionLog(
    riskAssessmentId: string,
    action: string,
    notes?: string,
    createdById?: string,
  ) {
    return db.aIInterventionLog.create({
      data: {
        riskAssessmentId,
        action,
        notes,
        createdById,
      },
    });
  }
}
