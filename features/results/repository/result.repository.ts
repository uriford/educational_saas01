import { db } from "@/lib/db";

export class ResultRepository {
  static async findAssessmentHistory(
    assessmentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessmentSubmission.findMany({
      where: {
        assessmentId,
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
          select: {
            totalMarks: true,
            passingMarks: true,
            _count: {
              select: {
                questions: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
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

  static async findSubmissionForTeacher(
    submissionId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessmentSubmission.findFirst({
      where: {
        id: submissionId,
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
        },
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  static async findStudentResults(
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessmentSubmission.findMany({
      where: {
        studentId,
        status: {
          in: ["SUBMITTED", "GRADED"],
        },
        assessment: {
          organizationId,
          deletedAt: null,
          ...(branchId
            ? { branchId }
            : {}),
        },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            passingMarks: true,
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        answers: {
          select: {
            answer: true,
            marksAwarded: true,
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

  static async findSubmissionForStudent(
    submissionId: string,
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessmentSubmission.findFirst({
      where: {
        id: submissionId,
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
        },
        answers: {
          include: {
            question: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  static async findLatestSubmissionForStudent(
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
        status: {
          in: ["SUBMITTED", "GRADED"],
        },
      },
      include: {
        assessment: {
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
        },
        answers: {
          include: {
            question: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getAttemptNumber(
    assessmentId: string,
    studentId: string,
    submissionCreatedAt: Date,
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
        createdAt: {
          lte: submissionCreatedAt,
        },
      },
    });
  }

  static async gradeAnswer(data: {
    submissionId: string;
    questionId: string;
    marksAwarded: number;
    organizationId: string;
    branchId: string;
  }) {
    return db.$transaction(async (tx) => {
      const submission = await tx.assessmentSubmission.findFirst({
        where: {
          id: data.submissionId,
          assessment: {
            organizationId: data.organizationId,
            branchId: data.branchId,
            deletedAt: null,
          },
        },
        include: {
          assessment: {
            select: {
              totalMarks: true,
              passingMarks: true,
            },
          },
        },
      });

      if (!submission) {
        throw new Error("Submission not found.");
      }

      if (submission.status === "IN_PROGRESS") {
        throw new Error("This assessment has not been submitted.");
      }

      const answer = await tx.assessmentAnswer.findUnique({
        where: {
          submissionId_questionId: {
            submissionId: data.submissionId,
            questionId: data.questionId,
          },
        },
        include: {
          question: {
            select: {
              type: true,
              marks: true,
            },
          },
        },
      });

      if (!answer) {
        throw new Error("Answer not found.");
      }

      if (
        answer.question.type !== "SHORT_ANSWER" &&
        answer.question.type !== "LONG_ANSWER"
      ) {
        throw new Error(
          "Only short and long answers can be manually graded.",
        );
      }

      const maxMarks = Number(answer.question.marks);

      if (
        !Number.isFinite(data.marksAwarded) ||
        data.marksAwarded < 0 ||
        data.marksAwarded > maxMarks
      ) {
        throw new Error(
          `Marks must be between 0 and ${maxMarks}.`,
        );
      }

      const updatedAnswer = await tx.assessmentAnswer.update({
        where: {
          id: answer.id,
        },
        data: {
          marksAwarded: data.marksAwarded,
          isCorrect: data.marksAwarded >= maxMarks,
        },
      });

      const allAnswers = await tx.assessmentAnswer.findMany({
        where: {
          submissionId: data.submissionId,
        },
        include: {
          question: {
            select: {
              type: true,
              marks: true,
            },
          },
        },
      });

      const pendingManualGrading = allAnswers.some(
        (item) =>
          (item.question.type === "SHORT_ANSWER" ||
            item.question.type === "LONG_ANSWER") &&
          item.answer !== null &&
          item.answer.trim().length > 0 &&
          item.marksAwarded === null,
      );

      const score = allAnswers.reduce(
        (total, item) =>
          total + Number(item.marksAwarded ?? 0),
        0,
      );

      const totalMarks = Number(
        submission.assessment.totalMarks,
      );

      const percentage =
        totalMarks > 0
          ? Number(
              ((score / totalMarks) * 100).toFixed(2),
            )
          : 0;

      const updatedSubmission =
        await tx.assessmentSubmission.update({
          where: {
            id: data.submissionId,
          },
          data: {
            score,
            percentage,
            status: pendingManualGrading
              ? "SUBMITTED"
              : "GRADED",
          },
        });

      return {
        answer: updatedAnswer,
        submission: updatedSubmission,
        pendingManualGrading,
      };
    });
  }
}
