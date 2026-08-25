import { db } from "@/lib/db";

export class AssessmentSubmissionRepository {
  static async findByAssessmentAndStudent(
    assessmentId: string,
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessmentSubmission.findFirst({
      where: {
        assessmentId,
        studentId,
        assessment: {
          organizationId,
          ...(branchId
            ? { branchId }
            : {}),
          deletedAt: null,
        },
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async countAttempts(
    assessmentId: string,
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessmentSubmission.count({
      where: {
        assessmentId,
        studentId,
        assessment: {
          organizationId,
          ...(branchId
            ? { branchId }
            : {}),
          deletedAt: null,
        },
      },
    });
  }

  static async findStudentForAssessment(
    studentId: string,
    organizationId: string,
    branchId: string | undefined,
    assessmentId: string,
  ) {
    return db.student.findFirst({
      where: {
        id: studentId,
        organizationId,
        ...(branchId
          ? { branchId }
          : {}),
        status: "ACTIVE",
        deletedAt: null,
        courseEnrollments: {
          some: {
            status: "ACTIVE",
            course: {
              assessments: {
                some: {
                  id: assessmentId,
                  organizationId,
                  ...(branchId
                    ? { branchId }
                    : {}),
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  static async create(
    assessmentId: string,
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    const assessment =
      await db.assessment.findFirst({
        where: {
          id: assessmentId,
          organizationId,
          ...(branchId
            ? { branchId }
            : {}),
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

    if (!assessment) {
      throw new Error(
        "Assessment not found.",
      );
    }

    return db.assessmentSubmission.create({
      data: {
        assessmentId,
        studentId,
        status: "IN_PROGRESS",
      },
      include: {
        assessment: {
          include: {
            questions: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  static async findById(
    id: string,
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessmentSubmission.findFirst({
      where: {
        id,
        studentId,
        assessment: {
          organizationId,
          ...(branchId
            ? { branchId }
            : {}),
          deletedAt: null,
        },
      },
      include: {
        assessment: {
          include: {
            questions: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        student: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  static async saveAnswer(data: {
    submissionId: string;
    studentId: string;
    organizationId: string;
    branchId?: string;
    questionId: string;
    answer?: string | null;
    marksAwarded?: number | null;
    isCorrect?: boolean | null;
  }) {
    return db.$transaction(async (tx) => {
      const submission =
        await tx.assessmentSubmission.findFirst({
          where: {
            id: data.submissionId,
            studentId: data.studentId,
            assessment: {
              organizationId: data.organizationId,
              ...(data.branchId
                ? { branchId: data.branchId }
                : {}),
              deletedAt: null,
            },
          },
        });

      if (!submission) {
        throw new Error(
          "Submission ownership validation failed.",
        );
      }

      const answer = await tx.assessmentAnswer.findUnique({
        where: {
          submissionId_questionId: {
            submissionId: data.submissionId,
            questionId: data.questionId,
          },
        },
      });

      if (answer) {
        return tx.assessmentAnswer.update({
          where: {
            id: answer.id,
          },
          data: {
            answer: data.answer ?? null,
            marksAwarded: data.marksAwarded ?? null,
            isCorrect: data.isCorrect ?? null,
          },
        });
      }

      return tx.assessmentAnswer.create({
        data: {
          submissionId: data.submissionId,
          questionId: data.questionId,
          answer: data.answer ?? null,
          marksAwarded: data.marksAwarded ?? null,
          isCorrect: data.isCorrect ?? null,
        },
      });
    });
  }

  static async submit(
    id: string,
    studentId: string,
    organizationId: string,
    branchId: string | undefined,
    score: number,
    percentage: number,
  ) {
    const submission =
      await db.assessmentSubmission.findFirst({
        where: {
          id,
          studentId,
          status: "IN_PROGRESS",
          assessment: {
            organizationId,
            ...(branchId
              ? { branchId }
              : {}),
            deletedAt: null,
          },
        },
        select: {
          id: true,
        },
      });

    if (!submission) {
      return null;
    }

    return db.assessmentSubmission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        score,
        percentage,
      },
      include: {
        assessment: {
          include: {
            questions: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  static async findAssessmentHistory(
    assessmentId: string,
    organizationId: string,
    branchId: string,
  ) {
    return db.assessmentSubmission.findMany({
      where: {
        assessmentId,
        assessment: {
          organizationId,
          branchId,
          deletedAt: null,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
          },
        },
        answers: {
          select: {
            questionId: true,
            answer: true,
            marksAwarded: true,
            isCorrect: true,
            question: {
              select: {
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
  }

  static async findAssessmentForStart(
    assessmentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
        ...(branchId
          ? { branchId }
          : {}),
        deletedAt: null,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        questions: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }
}
