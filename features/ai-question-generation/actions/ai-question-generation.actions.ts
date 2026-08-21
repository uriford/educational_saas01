"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { AIQuestionGenerationService } from "../services/ai-question-generation.service";

const ALLOWED_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ORGANIZATION_ADMIN,
  ROLES.BRANCH_ADMIN,
];

function getAuthenticatedContext() {
  return auth().then((session) => {
    if (!session?.user?.id) {
      return {
        success: false as const,
        message: "Unauthorized.",
      };
    }

    if (!ALLOWED_ROLES.includes(session.user.role)) {
      return {
        success: false as const,
        message:
          "You are not allowed to manage AI-generated questions.",
      };
    }

    if (!session.user.organizationId) {
      return {
        success: false as const,
        message: "Organization information is missing.",
      };
    }

    return {
      success: true as const,
      userId: session.user.id,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
    };
  });
}

import type { AIQuestionType } from "../types/ai-question.types";

type QuestionType = AIQuestionType;

type GeneratedQuestionInput = {
  question: string;
  type: QuestionType;
  marks: number;
  options?: string[];
  correctAnswer?: string | null;
};

/**
 * Get one AI generation together with:
 * - source documents
 * - generated questions
 */
export async function getAIGenerationAction(data: {
  generationId: string;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!data.generationId) {
    return {
      success: false,
      message: "Generation ID is required.",
    };
  }

  const generation =
    await AIQuestionGenerationService.getGeneration(
      data.generationId,
      context.organizationId,
      context.branchId,
    );

  if (!generation) {
    return {
      success: false,
      message: "AI question generation not found.",
    };
  }

  return {
    success: true,
    generation,
  };
}

/**
 * Save AI-generated questions for administrator review.
 */
export async function saveAIGeneratedQuestionsAction(data: {
  generationId: string;
  questions: GeneratedQuestionInput[];
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!data.generationId) {
    return {
      success: false,
      message: "Generation ID is required.",
    };
  }

  if (!Array.isArray(data.questions) || !data.questions.length) {
    return {
      success: false,
      message: "At least one generated question is required.",
    };
  }

  return AIQuestionGenerationService.saveGeneratedQuestions({
    generationId: data.generationId,
    organizationId: context.organizationId,
    branchId: context.branchId,
    questions: data.questions,
  });
}

/**
 * Edit a generated question while it is pending review.
 */
export async function updateAIGeneratedQuestionAction(data: {
  id: string;
  question?: string;
  type?: QuestionType;
  marks?: number;
  options?: string[];
  correctAnswer?: string | null;
  order?: number;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!data.id) {
    return {
      success: false,
      message: "Generated question ID is required.",
    };
  }

  return AIQuestionGenerationService.updateGeneratedQuestion({
    id: data.id,
    organizationId: context.organizationId,
    branchId: context.branchId,
    question: data.question,
    type: data.type,
    marks: data.marks,
    options: data.options,
    correctAnswer: data.correctAnswer,
    order: data.order,
  });
}

/**
 * Approve one generated question.
 */
export async function approveAIGeneratedQuestionAction(data: {
  id: string;
  reviewNote?: string | null;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!data.id) {
    return {
      success: false,
      message: "Generated question ID is required.",
    };
  }

  return AIQuestionGenerationService.approveGeneratedQuestion({
    id: data.id,
    organizationId: context.organizationId,
    branchId: context.branchId,
    reviewedById: context.userId,
    reviewNote: data.reviewNote,
  });
}

/**
 * Reject one generated question.
 */
export async function rejectAIGeneratedQuestionAction(data: {
  id: string;
  reviewNote?: string | null;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!data.id) {
    return {
      success: false,
      message: "Generated question ID is required.",
    };
  }

  return AIQuestionGenerationService.rejectGeneratedQuestion({
    id: data.id,
    organizationId: context.organizationId,
    branchId: context.branchId,
    reviewedById: context.userId,
    reviewNote: data.reviewNote,
  });
}


/**
 * Approve multiple AI-generated questions.
 */
export async function approveManyAIGeneratedQuestionsAction(data: {
  ids: string[];
  reviewNote?: string | null;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!data.ids.length) {
    return {
      success: false,
      message: "No questions selected.",
    };
  }

  return AIQuestionGenerationService.approveManyGeneratedQuestions({
    ids: data.ids,
    organizationId: context.organizationId,
    branchId: context.branchId,
    reviewedById: context.userId,
    reviewNote: data.reviewNote,
  });
}


/**
 * Reject multiple AI-generated questions.
 */
export async function rejectManyAIGeneratedQuestionsAction(data: {
  ids: string[];
  reviewNote?: string | null;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!data.ids.length) {
    return {
      success: false,
      message: "No questions selected.",
    };
  }

  return AIQuestionGenerationService.rejectManyGeneratedQuestions({
    ids: data.ids,
    organizationId: context.organizationId,
    branchId: context.branchId,
    reviewedById: context.userId,
    reviewNote: data.reviewNote,
  });
}


/**
 * Import one approved AI-generated question into an assessment.
 */
export async function importAIGeneratedQuestionAction(data: {
  generatedQuestionId: string;
  assessmentId: string;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!data.generatedQuestionId) {
    return {
      success: false,
      message: "Generated question ID is required.",
    };
  }

  if (!data.assessmentId) {
    return {
      success: false,
      message: "Assessment ID is required.",
    };
  }

  const { AIQuestionImportService } = await import(
    "../services/ai-question-import.service"
  );

  return AIQuestionImportService.importApprovedQuestion({
    generatedQuestionId: data.generatedQuestionId,
    assessmentId: data.assessmentId,
    organizationId: context.organizationId,
    branchId: context.branchId,
  });
}

/**
 * Create and run a complete source-grounded AI question generation.
 *
 * Workflow:
 * 1. Authenticate administrator.
 * 2. Validate source documents.
 * 3. Create generation record.
 * 4. Attach source documents.
 * 5. Process with OpenAI.
 * 6. Store generated questions as PENDING_REVIEW.
 */
export async function generateAIQuestionsAction(data: {
  assessmentId?: string | null;
  title?: string | null;
  description?: string | null;
  sourceDocumentIds: string[];
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty?: string;
  instructions?: string;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (
    !Array.isArray(data.sourceDocumentIds) ||
    data.sourceDocumentIds.length === 0
  ) {
    return {
      success: false,
      message: "At least one source document is required.",
    };
  }

  if (
    !Number.isInteger(data.questionCount) ||
    data.questionCount < 1
  ) {
    return {
      success: false,
      message:
        "Question count must be a positive whole number.",
    };
  }

  if (
    !Array.isArray(data.questionTypes) ||
    data.questionTypes.length === 0
  ) {
    return {
      success: false,
      message:
        "At least one question type is required.",
    };
  }

  const validQuestionTypes: QuestionType[] = [
    "MCQ",
    "TRUE_FALSE",
    "SHORT_ANSWER",
    "LONG_ANSWER",
  ];

  const questionTypes = [
    ...new Set(data.questionTypes),
  ];

  if (
    questionTypes.some(
      (type) => !validQuestionTypes.includes(type),
    )
  ) {
    return {
      success: false,
      message: "One or more question types are invalid.",
    };
  }

  if (data.assessmentId) {
    const { db } = await import("@/lib/db");

    const assessment = await db.assessment.findFirst({
      where: {
        id: data.assessmentId,
        organizationId: context.organizationId,
        branchId: context.branchId,
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!assessment) {
      return {
        success: false,
        message: "Assessment not found.",
      };
    }

    if (assessment.status !== "DRAFT") {
      return {
        success: false,
        message:
          "AI-generated questions can only be prepared for a draft assessment.",
      };
    }
  }

  try {
    const {
      AIQuestionGenerationRepository,
    } = await import(
      "../repository/ai-question-generation.repository"
    );

    const generation =
      await AIQuestionGenerationRepository.create({
        organizationId: context.organizationId,
        branchId: context.branchId,
        assessmentId: data.assessmentId ?? null,
        title: data.title?.trim() || null,
        description: data.description?.trim() || null,
        questionCount: data.questionCount,
        questionTypes,
        difficulty: data.difficulty?.trim() || "medium",
        instructions:
          data.instructions?.trim() || null,
        sourceDocumentIds: data.sourceDocumentIds,
        createdById: context.userId,
      });

    const {
      AIQuestionGenerationRunService,
    } = await import(
      "../services/ai-question-generation-run.service"
    );

    return AIQuestionGenerationRunService.run({
      generationId: generation.id,
      organizationId: context.organizationId,
      branchId: context.branchId,
      sourceDocumentIds: data.sourceDocumentIds,
      questionCount: data.questionCount,
      questionTypes,
      difficulty: data.difficulty,
      instructions: data.instructions,
    });
  } catch (error) {
    console.error(
      "CREATE AI QUESTION GENERATION ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to start AI question generation.",
    };
  }
}
