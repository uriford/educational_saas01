import { AIQuestionGenerationRepository } from "../repository/ai-question-generation.repository";
import { AIQuestionGeneratorService } from "./ai-question-generator.service";
import { AISourceContextService } from "./ai-source-context.service";
import { AIQuestionGenerationService } from "./ai-question-generation.service";
import type { AIQuestionType } from "../types/ai-question.types";

export class AIQuestionGenerationRunService {
  static async run(data: {
    generationId: string;
    organizationId: string;
    branchId: string;
    sourceDocumentIds: string[];
    questionCount: number;
    questionTypes: AIQuestionType[];
    difficulty?: string;
    instructions?: string;
  }) {
    try {
      await AIQuestionGenerationRepository.markProcessing(
        data.generationId,
      );

      const context = await AISourceContextService.build({
        organizationId: data.organizationId,
        branchId: data.branchId,
        sourceDocumentIds: data.sourceDocumentIds,
      });

      const generated =
        await AIQuestionGeneratorService.generate({
          sourceText: context.combinedText,
          questionCount: data.questionCount,
          questionTypes: data.questionTypes,
          difficulty: data.difficulty,
          instructions: data.instructions,
        });

      const saveResult =
        await AIQuestionGenerationService.saveGeneratedQuestions({
          generationId: data.generationId,
          organizationId: data.organizationId,
          branchId: data.branchId,
          questions: generated.questions.map((question) => ({
            question: question.question,
            type: question.type,
            marks: question.marks,
            options: question.options,
            correctAnswer: question.correctAnswer,
          })),
        });

      if (!saveResult.success) {
        throw new Error(
          saveResult.message ||
            "Failed to save generated questions.",
        );
      }

      return {
        success: true,
        generationId: data.generationId,
        questions: saveResult.questions,
        generated,
        sourceDocuments: context.documents,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "AI question generation failed.";

      console.error(
        "AI QUESTION GENERATION RUN ERROR:",
        error,
      );

      try {
        await AIQuestionGenerationRepository.markFailed(
          data.generationId,
          message,
        );
      } catch (markFailedError) {
        console.error(
          "FAILED TO MARK AI GENERATION AS FAILED:",
          markFailedError,
        );
      }

      return {
        success: false,
        generationId: data.generationId,
        message,
      };
    }
  }
}
