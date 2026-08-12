import { AIGeneratedQuestionRepository } from "../repository/ai-generated-question.repository";
import { AssessmentQuestionService } from "@/features/assessment-questions/services/assessment-question.service";

export class AIQuestionImportService {
  static async importApprovedQuestion(data: {
    generatedQuestionId: string;
    assessmentId: string;
    organizationId: string;
    branchId: string;
  }) {
    try {
      const generatedQuestion =
        await AIGeneratedQuestionRepository.findById(
          data.generatedQuestionId,
        );

      if (!generatedQuestion) {
        return {
          success: false,
          message: "Generated question not found.",
        };
      }

      if (
        generatedQuestion.generation.organizationId !==
          data.organizationId ||
        generatedQuestion.generation.branchId !== data.branchId
      ) {
        return {
          success: false,
          message: "Generated question not found.",
        };
      }

      if (generatedQuestion.status !== "APPROVED") {
        return {
          success: false,
          message:
            "Only approved AI-generated questions can be imported.",
        };
      }

      if (generatedQuestion.assessmentQuestionId) {
        return {
          success: false,
          message:
            "This AI-generated question has already been imported.",
        };
      }

      const result = await AssessmentQuestionService.create({
        assessmentId: data.assessmentId,
        organizationId: data.organizationId,
        branchId: data.branchId,
        question: generatedQuestion.question,
        type: generatedQuestion.type,
        marks: Number(generatedQuestion.marks),
        options: Array.isArray(generatedQuestion.options)
          ? generatedQuestion.options.filter(
              (option): option is string =>
                typeof option === "string",
            )
          : undefined,
        correctAnswer: generatedQuestion.correctAnswer,
        order: generatedQuestion.order,
      });

      if (!result.success || !result.question) {
        return {
          success: false,
          message:
            result.message ||
            "Failed to create assessment question.",
        };
      }

      const linkResult =
        await AIGeneratedQuestionRepository.linkAssessmentQuestion(
          generatedQuestion.id,
          result.question.id,
        );

      if (linkResult.count === 0) {
        return {
          success: false,
          message:
            "Assessment question was created, but the AI question could not be linked.",
          question: result.question,
        };
      }

      return {
        success: true,
        message:
          "Approved AI-generated question imported successfully.",
        question: result.question,
      };
    } catch (error) {
      console.error(
        "IMPORT AI GENERATED QUESTION ERROR:",
        error,
      );

      return {
        success: false,
        message:
          "Failed to import AI-generated question.",
      };
    }
  }
}
