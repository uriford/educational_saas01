import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AIQuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER";

type AIQuestionReviewStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export class AIGeneratedQuestionRepository {
  static async create(data: {
    generationId: string;
    question: string;
    type: AIQuestionType;
    marks: number;
    options?: Prisma.InputJsonValue;
    correctAnswer?: string | null;
    order?: number;
  }) {
    return db.aIGeneratedQuestion.create({
      data: {
        generationId: data.generationId,
        question: data.question,
        type: data.type,
        marks: data.marks,
        options: data.options,
        correctAnswer: data.correctAnswer,
        order: data.order ?? 0,
      },
    });
  }

  static async createMany(
    data: Array<{
      generationId: string;
      question: string;
      type: AIQuestionType;
      marks: number;
      options?: Prisma.InputJsonValue;
      correctAnswer?: string | null;
      order?: number;
    }>,
  ) {
    return db.aIGeneratedQuestion.createMany({
      data: data.map((question) => ({
        generationId: question.generationId,
        question: question.question,
        type: question.type,
        marks: question.marks,
        options: question.options,
        correctAnswer: question.correctAnswer,
        order: question.order ?? 0,
      })),
    });
  }

  static async findById(id: string) {
    return db.aIGeneratedQuestion.findFirst({
      where: {
        id,
      },
      include: {
        generation: true,
        assessmentQuestion: true,
      },
    });
  }

  static async findAllByGenerationId(
    generationId: string,
  ) {
    return db.aIGeneratedQuestion.findMany({
      where: {
        generationId,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  static async findAllByGenerationIdAndStatus(
    generationId: string,
    status: AIQuestionReviewStatus,
  ) {
    return db.aIGeneratedQuestion.findMany({
      where: {
        generationId,
        status,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  static async update(
    id: string,
    data: {
      question?: string;
      type?: AIQuestionType;
      marks?: number;
      options?: Prisma.InputJsonValue;
      correctAnswer?: string | null;
      order?: number;
    },
  ) {
    return db.aIGeneratedQuestion.updateMany({
      where: {
        id,
        status: "PENDING_REVIEW",
      },
      data,
    });
  }

  static async approve(
    id: string,
    data: {
      reviewedById: string;
      reviewNote?: string | null;
    },
  ) {
    return db.aIGeneratedQuestion.updateMany({
      where: {
        id,
        status: "PENDING_REVIEW",
      },
      data: {
        status: "APPROVED",
        reviewedById: data.reviewedById,
        reviewedAt: new Date(),
        reviewNote: data.reviewNote ?? null,
      },
    });
  }

  static async reject(
    id: string,
    data: {
      reviewedById: string;
      reviewNote?: string | null;
    },
  ) {
    return db.aIGeneratedQuestion.updateMany({
      where: {
        id,
        status: "PENDING_REVIEW",
      },
      data: {
        status: "REJECTED",
        reviewedById: data.reviewedById,
        reviewedAt: new Date(),
        reviewNote: data.reviewNote ?? null,
      },
    });
  }

  static async linkAssessmentQuestion(
    id: string,
    assessmentQuestionId: string,
  ) {
    return db.aIGeneratedQuestion.updateMany({
      where: {
        id,
        status: "APPROVED",
        assessmentQuestionId: null,
      },
      data: {
        assessmentQuestionId,
      },
    });
  }

  static async approveMany(
    ids: string[],
    data: {
      reviewedById: string;
      reviewNote?: string | null;
    },
  ) {
    return db.aIGeneratedQuestion.updateMany({
      where: {
        id: {
          in: ids,
        },
        status: "PENDING_REVIEW",
      },
      data: {
        status: "APPROVED",
        reviewedById: data.reviewedById,
        reviewedAt: new Date(),
        reviewNote: data.reviewNote ?? null,
      },
    });
  }


  static async rejectMany(
    ids: string[],
    data: {
      reviewedById: string;
      reviewNote?: string | null;
    },
  ) {
    return db.aIGeneratedQuestion.updateMany({
      where: {
        id: {
          in: ids,
        },
        status: "PENDING_REVIEW",
      },
      data: {
        status: "REJECTED",
        reviewedById: data.reviewedById,
        reviewedAt: new Date(),
        reviewNote: data.reviewNote ?? null,
      },
    });
  }


}
