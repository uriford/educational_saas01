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
      answers: true,
    },
    orderBy: {
      createdAt: "desc",
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
        answers: true,
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
        answer: data.answer,
        marksAwarded: data.marksAwarded,
        isCorrect: data.isCorrect,
      },
      update: {
        answer: data.answer,
        marksAwarded: data.marksAwarded,
        isCorrect: data.isCorrect,
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
      },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        score,
        percentage,
      },
    });
  }
  static async findAssessmentForStart(
  assessmentId: string,
) {
  return db.assessment.findUnique({
    where: {
      id: assessmentId,
    },
  });
}
}
