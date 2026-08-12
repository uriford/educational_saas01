import { db } from "@/lib/db";
import { AIGeneratedQuestionRepository } from "../repository/ai-generated-question.repository";

type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER";

type GeneratedQuestionInput = {
  question: string;
  type: QuestionType;
  marks: number;
  options?: string[];
  correctAnswer?: string | null;
};

export class AIQuestionGenerationService {
  static async getGeneration(
    generationId: string,
    organizationId: string,
    branchId: string,
  ) {
    const generation = await db.aIQuestionGeneration.findFirst({
      where: {
        id: generationId,
        organizationId,
        branchId,
      },
      include: {
        sourceDocuments: true,
        generatedQuestionsReview: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return generation;
  }

  static async saveGeneratedQuestions(data: {
    generationId: string;
    organizationId: string;
    branchId: string;
    questions: GeneratedQuestionInput[];
  }) {
    try {
      const generation = await db.aIQuestionGeneration.findFirst({
        where: {
          id: data.generationId,
          organizationId: data.organizationId,
          branchId: data.branchId,
        },
      });

      if (!generation) {
        return {
          success: false,
          message: "AI question generation record not found.",
        };
      }

      if (generation.status !== "PROCESSING") {
        return {
          success: false,
          message:
            "Questions can only be saved while generation is processing.",
        };
      }

      if (!data.questions.length) {
        return {
          success: false,
          message: "No generated questions were provided.",
        };
      }

      const normalizedQuestions: Array<{
        generationId: string;
        question: string;
        type: QuestionType;
        marks: number;
        options?: string[];
        correctAnswer?: string | null;
        order: number;
      }> = [];

      for (let index = 0; index < data.questions.length; index++) {
        const item = data.questions[index];

        if (!item.question?.trim()) {
          return {
            success: false,
            message: `Generated question ${index + 1} is missing question text.`,
          };
        }

        if (!Number.isFinite(item.marks) || item.marks <= 0) {
          return {
            success: false,
            message: `Generated question ${index + 1} has invalid marks.`,
          };
        }

        let options: string[] | undefined;
        let correctAnswer = item.correctAnswer?.trim() || null;

        if (item.type === "MCQ") {
          const cleanedOptions = (item.options ?? [])
            .map((option) => option.trim())
            .filter(Boolean);

          if (cleanedOptions.length < 2) {
            return {
              success: false,
              message: `Generated MCQ ${index + 1} must have at least two options.`,
            };
          }

          if (!correctAnswer) {
            return {
              success: false,
              message: `Generated MCQ ${index + 1} is missing its correct answer.`,
            };
          }

          if (!cleanedOptions.includes(correctAnswer)) {
            return {
              success: false,
              message: `Generated MCQ ${index + 1} has an invalid correct answer.`,
            };
          }

          options = cleanedOptions;
        }

        if (item.type === "TRUE_FALSE") {
          options = ["TRUE", "FALSE"];

          const normalizedAnswer = correctAnswer?.toUpperCase();

          if (
            normalizedAnswer !== "TRUE" &&
            normalizedAnswer !== "FALSE"
          ) {
            return {
              success: false,
              message:
                `Generated True/False question ${index + 1} must have ` +
                `"TRUE" or "FALSE" as its correct answer.`,
            };
          }

          correctAnswer = normalizedAnswer;
        }

        if (
          item.type === "SHORT_ANSWER" ||
          item.type === "LONG_ANSWER"
        ) {
          options = undefined;
        }

        normalizedQuestions.push({
          generationId: data.generationId,
          question: item.question.trim(),
          type: item.type,
          marks: item.marks,
          options,
          correctAnswer,
          order: index + 1,
        });
      }

      await db.$transaction(async (tx) => {
        await tx.aIGeneratedQuestion.deleteMany({
          where: {
            generationId: data.generationId,
            status: "PENDING_REVIEW",
          },
        });

        await tx.aIGeneratedQuestion.createMany({
          data: normalizedQuestions.map((question) => ({
            generationId: question.generationId,
            question: question.question,
            type: question.type,
            marks: question.marks,
            options: question.options,
            correctAnswer: question.correctAnswer,
            order: question.order,
          })),
        });

        await tx.aIQuestionGeneration.update({
          where: {
            id: data.generationId,
          },
          data: {
            status: "COMPLETED",
            questionCount: normalizedQuestions.length,
            completedAt: new Date(),
            errorMessage: null,
          },
        });
      });

      const generatedQuestions =
        await AIGeneratedQuestionRepository.findAllByGenerationId(
          data.generationId,
        );

      return {
        success: true,
        message: "Generated questions saved for review.",
        questions: generatedQuestions,
      };
    } catch (error) {
      console.error(
        "SAVE AI GENERATED QUESTIONS ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to save generated questions.",
      };
    }
  }

  static async updateGeneratedQuestion(data: {
    id: string;
    organizationId: string;
    branchId: string;
    question?: string;
    type?: QuestionType;
    marks?: number;
    options?: string[];
    correctAnswer?: string | null;
    order?: number;
  }) {
    try {
      const existing =
        await AIGeneratedQuestionRepository.findById(data.id);

      if (
        !existing ||
        existing.generation.organizationId !== data.organizationId ||
        existing.generation.branchId !== data.branchId
      ) {
        return {
          success: false,
          message: "Generated question not found.",
        };
      }

      if (existing.status !== "PENDING_REVIEW") {
        return {
          success: false,
          message:
            "Only questions pending review can be edited.",
        };
      }

      if (
        data.question !== undefined &&
        !data.question.trim()
      ) {
        return {
          success: false,
          message: "Question text is required.",
        };
      }

      if (
        data.marks !== undefined &&
        (!Number.isFinite(data.marks) || data.marks <= 0)
      ) {
        return {
          success: false,
          message: "Question marks must be greater than zero.",
        };
      }

      const type = data.type ?? existing.type;

      let options = data.options;
      let correctAnswer =
        data.correctAnswer ?? existing.correctAnswer;

      if (type === "MCQ") {
        if (!options) {
          options = Array.isArray(existing.options)
            ? existing.options.filter(
                (option): option is string =>
                  typeof option === "string",
              )
            : [];
        }

        options = options
          .map((option) => option.trim())
          .filter(Boolean);

        if (options.length < 2) {
          return {
            success: false,
            message:
              "MCQ questions must have at least two valid options.",
          };
        }

        if (!correctAnswer?.trim()) {
          return {
            success: false,
            message: "Please provide the correct answer.",
          };
        }

        correctAnswer = correctAnswer.trim();

        if (!options.includes(correctAnswer)) {
          return {
            success: false,
            message:
              "Correct answer must match one of the options.",
          };
        }
      }

      if (type === "TRUE_FALSE") {
        options = ["TRUE", "FALSE"];

        const normalizedAnswer =
          correctAnswer?.trim().toUpperCase();

        if (
          normalizedAnswer !== "TRUE" &&
          normalizedAnswer !== "FALSE"
        ) {
          return {
            success: false,
            message:
              "True/False answer must be TRUE or FALSE.",
          };
        }

        correctAnswer = normalizedAnswer;
      }

      if (
        type === "SHORT_ANSWER" ||
        type === "LONG_ANSWER"
      ) {
        options = undefined;
      }

      const result =
        await AIGeneratedQuestionRepository.update(
          data.id,
          {
            question: data.question?.trim(),
            type,
            marks: data.marks,
            options,
            correctAnswer: correctAnswer?.trim() || null,
            order: data.order,
          },
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Generated question could not be updated.",
        };
      }

      return {
        success: true,
        message: "Generated question updated successfully.",
      };
    } catch (error) {
      console.error(
        "UPDATE AI GENERATED QUESTION ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to update generated question.",
      };
    }
  }

  static async approveGeneratedQuestion(data: {
    id: string;
    organizationId: string;
    branchId: string;
    reviewedById: string;
    reviewNote?: string | null;
  }) {
    try {
      const existing =
        await AIGeneratedQuestionRepository.findById(data.id);

      if (
        !existing ||
        existing.generation.organizationId !== data.organizationId ||
        existing.generation.branchId !== data.branchId
      ) {
        return {
          success: false,
          message: "Generated question not found.",
        };
      }

      if (existing.status !== "PENDING_REVIEW") {
        return {
          success: false,
          message:
            "Only questions pending review can be approved.",
        };
      }

      const result =
        await AIGeneratedQuestionRepository.approve(
          data.id,
          {
            reviewedById: data.reviewedById,
            reviewNote: data.reviewNote?.trim() || null,
          },
        );

      if (result.count === 0) {
        return {
          success: false,
          message:
            "Question could not be approved.",
        };
      }

      return {
        success: true,
        message: "Generated question approved.",
      };
    } catch (error) {
      console.error(
        "APPROVE AI GENERATED QUESTION ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to approve generated question.",
      };
    }
  }

  static async rejectGeneratedQuestion(data: {
    id: string;
    organizationId: string;
    branchId: string;
    reviewedById: string;
    reviewNote?: string | null;
  }) {
    try {
      const existing =
        await AIGeneratedQuestionRepository.findById(data.id);

      if (
        !existing ||
        existing.generation.organizationId !== data.organizationId ||
        existing.generation.branchId !== data.branchId
      ) {
        return {
          success: false,
          message: "Generated question not found.",
        };
      }

      if (existing.status !== "PENDING_REVIEW") {
        return {
          success: false,
          message:
            "Only questions pending review can be rejected.",
        };
      }

      const result =
        await AIGeneratedQuestionRepository.reject(
          data.id,
          {
            reviewedById: data.reviewedById,
            reviewNote: data.reviewNote?.trim() || null,
          },
        );

      if (result.count === 0) {
        return {
          success: false,
          message:
            "Question could not be rejected.",
        };
      }

      return {
        success: true,
        message: "Generated question rejected.",
      };
    } catch (error) {
      console.error(
        "REJECT AI GENERATED QUESTION ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to reject generated question.",
      };
    }
  }

  static async approveManyGeneratedQuestions(data: {
    ids: string[];
    organizationId: string;
    branchId: string;
    reviewedById: string;
    reviewNote?: string | null;
  }) {
    try {
      if (!data.ids.length) {
        return {
          success: false,
          message: "No questions selected.",
        };
      }

      const result =
        await AIGeneratedQuestionRepository.approveMany(
          data.ids,
          {
            reviewedById: data.reviewedById,
            reviewNote: data.reviewNote?.trim() || null,
          },
        );

      return {
        success: true,
        message: `${result.count} questions approved.`,
        count: result.count,
      };

    } catch (error) {
      console.error(
        "BULK APPROVE AI QUESTIONS ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to approve questions.",
      };
    }
  }


  static async rejectManyGeneratedQuestions(data: {
    ids: string[];
    organizationId: string;
    branchId: string;
    reviewedById: string;
    reviewNote?: string | null;
  }) {
    try {
      if (!data.ids.length) {
        return {
          success: false,
          message: "No questions selected.",
        };
      }

      const result =
        await AIGeneratedQuestionRepository.rejectMany(
          data.ids,
          {
            reviewedById: data.reviewedById,
            reviewNote: data.reviewNote?.trim() || null,
          },
        );

      return {
        success: true,
        message: `${result.count} questions rejected.`,
        count: result.count,
      };

    } catch (error) {
      console.error(
        "BULK REJECT AI QUESTIONS ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to reject questions.",
      };
    }
  }


}
