import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export class AIQuestionGenerationRepository {
  static async create(data: {
    organizationId: string;
    branchId: string;
    assessmentId?: string | null;
    title?: string | null;
    description?: string | null;
    questionCount: number;
    questionTypes?: unknown;
    difficulty?: string | null;
    instructions?: string | null;
    sourceDocumentIds: string[];
    createdById?: string | null;
  }) {
    const sourceDocumentIds = [
      ...new Set(
        data.sourceDocumentIds
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ];

    if (sourceDocumentIds.length === 0) {
      throw new Error(
        "At least one source document is required.",
      );
    }

    const sourceDocuments =
      await db.aISourceDocument.findMany({
        where: {
          id: {
            in: sourceDocumentIds,
          },
          organizationId: data.organizationId,
          branchId: data.branchId,
          status: "READY",
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

    if (sourceDocuments.length !== sourceDocumentIds.length) {
      throw new Error(
        "One or more selected source documents are unavailable or do not belong to this organization/branch.",
      );
    }

    return db.aIQuestionGeneration.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        assessmentId: data.assessmentId ?? null,
        title: data.title ?? null,
        description: data.description ?? null,
        questionCount: data.questionCount,
        questionTypes:
          data.questionTypes ?? Prisma.JsonNull,
        difficulty: data.difficulty ?? null,
        instructions: data.instructions ?? null,
        createdById: data.createdById ?? null,
        sourceDocuments: {
          connect: sourceDocumentIds.map((id) => ({
            id,
          })),
        },
      },
      include: {
        sourceDocuments: true,
      },
    });
  }

  static async markProcessing(id: string) {
    return db.aIQuestionGeneration.update({
      where: { id },
      data: {
        status: "PROCESSING",
        startedAt: new Date(),
        errorMessage: null,
      },
    });
  }

  static async markCompleted(
    id: string,
    generatedQuestions: unknown,
    model: string,
  ) {
    return db.aIQuestionGeneration.update({
      where: { id },
      data: {
        status: "COMPLETED",
        generatedQuestions: generatedQuestions as Prisma.InputJsonValue,
        model,
        completedAt: new Date(),
        errorMessage: null,
      },
    });
  }

  static async markFailed(
    id: string,
    errorMessage: string,
  ) {
    return db.aIQuestionGeneration.update({
      where: { id },
      data: {
        status: "FAILED",
        errorMessage,
      },
    });
  }

  static async findById(
    id: string,
    organizationId: string,
    branchId: string,
  ) {
    return db.aIQuestionGeneration.findFirst({
      where: {
        id,
        organizationId,
        branchId,
      },
      include: {
        sourceDocuments: true,
        assessment: true,
      },
    });
  }
}
