import { db } from "@/lib/db";

export class AssessmentSubmissionRepository {
  static async findByAssessmentAndStudent(
    assessmentId: string,
    studentId: string,
  ) {
    return db.assessmentSubmission.findFirst({
      where: {
        assessmentId,
        studentId,
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
  ) {
    return db.assessmentSubmission.count({
      where: {
        assessmentId,
        studentId,
      },
    });
  }

  static async findStudentForAssessment(
    studentId: string,
    organizationId: string,
    branchId: string,
    assessmentId: string,
  ) {
    return db.student.findFirst({
      where: {
        id: studentId,
        organizationId,
        branchId,
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
                  branchId,
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
  ) {
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

  static async findById(id: string) {
    return db.assessmentSubmission.findUnique({
      where: {
        id,
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
    questionId: string;
    answer?: string | null;
    marksAwarded?: number | null;
    isCorrect?: boolean | null;
  }) {
    return db.assessmentAnswer.upsert({
      where: {
        submissionId_questionId: {
          submissionId: data.submissionId,
          questionId: data.questionId,
        },
      },
      create: {
        submissionId: data.submissionId,
        questionId: data.questionId,
        answer: data.answer ?? null,
        marksAwarded: data.marksAwarded ?? null,
        isCorrect: data.isCorrect ?? null,
      },
      update: {
        answer: data.answer ?? null,
        marksAwarded: data.marksAwarded ?? null,
        isCorrect: data.isCorrect ?? null,
      },
    });
  }

  static async submit(
    id: string,
    score: number,
    percentage: number,
  ) {
    return db.assessmentSubmission.update({
      where: {
        id,
        status: "IN_PROGRESS",
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
    branchId: string,
  ) {
    return db.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
        branchId,
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
