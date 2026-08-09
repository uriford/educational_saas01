import { db } from "@/lib/db";
import { AssessmentQuestionRepository } from "../repository/assessment-question.repository";

type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER";

type QuestionOptions = string[];

export class AssessmentQuestionService {
  static async create(data: {
    assessmentId: string;
    organizationId: string;
    branchId: string;
    question: string;
    type: QuestionType;
    marks: number;
    options?: QuestionOptions;
    correctAnswer?: string | null;
    order?: number;
  }) {
    try {
      if (!data.question.trim()) {
        return {
          success: false,
          message: "Question text is required.",
        };
      }

      if (!Number.isFinite(data.marks) || data.marks <= 0) {
        return {
          success: false,
          message: "Question marks must be greater than zero.",
        };
      }

      const assessment = await db.assessment.findFirst({
        where: {
          id: data.assessmentId,
          organizationId: data.organizationId,
          branchId: data.branchId,
          deletedAt: null,
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
            "Questions can only be added to a draft assessment.",
        };
      }

      if (data.type === "MCQ") {
        if (!data.options || data.options.length < 2) {
          return {
            success: false,
            message: "MCQ questions must have at least two options.",
          };
        }

        const cleanedOptions = data.options
          .map((option) => option.trim())
          .filter(Boolean);

        if (cleanedOptions.length < 2) {
          return {
            success: false,
            message: "MCQ questions must have at least two valid options.",
          };
        }

        if (!data.correctAnswer?.trim()) {
          return {
            success: false,
            message: "Please provide the correct answer.",
          };
        }

        if (!cleanedOptions.includes(data.correctAnswer.trim())) {
          return {
            success: false,
            message: "Correct answer must match one of the options.",
          };
        }

        data.options = cleanedOptions;
        data.correctAnswer = data.correctAnswer.trim();
      }

      if (data.type === "TRUE_FALSE") {
        if (!data.correctAnswer) {
          return {
            success: false,
            message: "Please provide the correct answer.",
          };
        }

        if (
          data.correctAnswer !== "TRUE" &&
          data.correctAnswer !== "FALSE"
        ) {
          return {
            success: false,
            message: "True/False answer must be TRUE or FALSE.",
          };
        }

        data.options = ["TRUE", "FALSE"];
      }

      if (
        data.type === "SHORT_ANSWER" ||
        data.type === "LONG_ANSWER"
      ) {
        data.options = undefined;
      }

      const existingQuestions =
        await AssessmentQuestionRepository.findAll(
          data.assessmentId,
        );

      const questionOrder =
        data.order ??
        (existingQuestions.length > 0
          ? Math.max(
              ...existingQuestions.map(
                (question) => question.order,
              ),
            ) + 1
          : 1);

      const question =
        await AssessmentQuestionRepository.create({
          assessmentId: data.assessmentId,
          question: data.question.trim(),
          type: data.type,
          marks: data.marks,
          options: data.options,
          correctAnswer: data.correctAnswer?.trim() || null,
          order: questionOrder,
        });

      return {
        success: true,
        message: "Question created successfully.",
        question,
      };
    } catch (error) {
      console.error(
        "CREATE ASSESSMENT QUESTION ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to create question.",
      };
    }
  }

  static async getById(
    id: string,
    organizationId: string,
    branchId: string,
  ) {
    const question =
      await AssessmentQuestionRepository.findById(id);

    if (
      !question ||
      question.deletedAt ||
      question.assessment.organizationId !== organizationId ||
      question.assessment.branchId !== branchId
    ) {
      return null;
    }

    return question;
  }

  static async getAll(
    assessmentId: string,
    organizationId: string,
    branchId: string,
  ) {
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
        branchId,
        deletedAt: null,
      },
    });

    if (!assessment) {
      return [];
    }

    return AssessmentQuestionRepository.findAll(
      assessmentId,
    );
  }

  static async update(data: {
    id: string;
    organizationId: string;
    branchId: string;
    question?: string;
    type?: QuestionType;
    marks?: number;
    options?: QuestionOptions;
    correctAnswer?: string | null;
    order?: number;
  }) {
    try {
      const existing =
        await AssessmentQuestionRepository.findById(
          data.id,
        );

      if (
        !existing ||
        existing.assessment.organizationId !== data.organizationId ||
        existing.assessment.branchId !== data.branchId ||
        existing.deletedAt
      ) {
        return {
          success: false,
          message: "Question not found.",
        };
      }

      if (existing.assessment.status !== "DRAFT") {
        return {
          success: false,
          message:
            "Questions can only be edited while the assessment is in draft status.",
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
        (!Number.isFinite(data.marks) ||
          data.marks <= 0)
      ) {
        return {
          success: false,
          message: "Question marks must be greater than zero.",
        };
      }

      const type = data.type ?? existing.type;

      let options = data.options;
      let correctAnswer = data.correctAnswer;

      if (type === "MCQ") {
        if (!options) {
          const existingOptions =
            existing.options;

          options = Array.isArray(existingOptions)
            ? existingOptions.filter(
                (option): option is string =>
                  typeof option === "string",
              )
            : [];
        }

        const cleanedOptions = options
          .map((option) => option.trim())
          .filter(Boolean);

        if (cleanedOptions.length < 2) {
          return {
            success: false,
            message:
              "MCQ questions must have at least two valid options.",
          };
        }

        correctAnswer =
          correctAnswer ?? existing.correctAnswer;

        if (!correctAnswer?.trim()) {
          return {
            success: false,
            message: "Please provide the correct answer.",
          };
        }

        if (!cleanedOptions.includes(correctAnswer.trim())) {
          return {
            success: false,
            message:
              "Correct answer must match one of the options.",
          };
        }

        options = cleanedOptions;
        correctAnswer = correctAnswer.trim();
      }

      if (type === "TRUE_FALSE") {
        options = ["TRUE", "FALSE"];

        correctAnswer =
          correctAnswer ?? existing.correctAnswer;

        if (
          correctAnswer !== "TRUE" &&
          correctAnswer !== "FALSE"
        ) {
          return {
            success: false,
            message:
              "True/False answer must be TRUE or FALSE.",
          };
        }
      }

      if (
        type === "SHORT_ANSWER" ||
        type === "LONG_ANSWER"
      ) {
        options = undefined;
      }

      const result =
        await AssessmentQuestionRepository.update(
          data.id,
          {
            question:
              data.question?.trim(),
            type,
            marks: data.marks,
            options,
            correctAnswer:
              correctAnswer?.trim() || null,
            order: data.order,
          },
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Question not found.",
        };
      }

      return {
        success: true,
        message: "Question updated successfully.",
      };
    } catch (error) {
      console.error(
        "UPDATE ASSESSMENT QUESTION ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to update question.",
      };
    }
  }

  static async delete(data: {
    id: string;
    organizationId: string;
    branchId: string;
  }) {
    try {
      const existing =
        await AssessmentQuestionRepository.findById(
          data.id,
        );

      if (
        !existing ||
        existing.assessment.organizationId !==
          data.organizationId ||
        existing.assessment.branchId !==
          data.branchId ||
        existing.deletedAt
      ) {
        return {
          success: false,
          message: "Question not found.",
        };
      }

      if (existing.assessment.status !== "DRAFT") {
        return {
          success: false,
          message:
            "Questions can only be deleted while the assessment is in draft status.",
        };
      }

      const result =
        await AssessmentQuestionRepository.softDelete(
          data.id,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Question not found.",
        };
      }

      return {
        success: true,
        message: "Question deleted successfully.",
      };
    } catch (error) {
      console.error(
        "DELETE ASSESSMENT QUESTION ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to delete question.",
      };
    }
  }
}