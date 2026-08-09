import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export class AssessmentQuestionRepository {
  static async create(data: {
    assessmentId: string;
    question: string;
    type:
      | "MCQ"
      | "TRUE_FALSE"
      | "SHORT_ANSWER"
      | "LONG_ANSWER";
    marks: number;
    options?: Prisma.InputJsonValue;
    correctAnswer?: string | null;
    order?: number;
  }) {
    return db.assessmentQuestion.create({
      data: {
        assessmentId: data.assessmentId,
        question: data.question,
        type: data.type,
        marks: data.marks,
        options: data.options,
        correctAnswer: data.correctAnswer,
        order: data.order ?? 0,
      },
    });
  }

  static async findById(id: string) {
    return db.assessmentQuestion.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        assessment: true,
      },
    });
  }

  static async findAll(assessmentId: string) {
    return db.assessmentQuestion.findMany({
      where: {
        assessmentId,
        deletedAt: null,
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
      type?:
        | "MCQ"
        | "TRUE_FALSE"
        | "SHORT_ANSWER"
        | "LONG_ANSWER";
      marks?: number;
      options?: Prisma.InputJsonValue;
      correctAnswer?: string | null;
      order?: number;
    },
  ) {
    return db.assessmentQuestion.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  }

  static async softDelete(id: string) {
    return db.assessmentQuestion.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}