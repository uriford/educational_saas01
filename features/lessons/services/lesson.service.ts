import { LessonRepository } from "../repository/lesson.repository";

import type {
  CreateLessonRepositoryData,
  UpdateLessonData,
} from "../types";

export class LessonService {
  static async create(
    data: CreateLessonRepositoryData,
  ) {
    try {
      await LessonRepository.create(data);

      return {
        success: true,
        message: "Lesson created successfully.",
      };
    } catch (error) {
      console.error(
        "CREATE LESSON SERVICE ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to create lesson.",
      };
    }
  }

  static async getAll(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return LessonRepository.findAll(
      courseId,
      organizationId,
      branchId,
    );
  }

  static async getById(
    id: string,
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return LessonRepository.findById(
      id,
      courseId,
      organizationId,
      branchId,
    );
  }

  static async update(
    id: string,
    courseId: string,
    organizationId: string,
    branchId: string,
    data: UpdateLessonData,
    updatedById?: string,
  ) {
    try {
      const result =
        await LessonRepository.update(
          id,
          courseId,
          organizationId,
          branchId,
          {
            ...data,
            updatedById,
          },
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Lesson not found.",
        };
      }

      return {
        success: true,
        message: "Lesson updated successfully.",
      };
    } catch (error) {
      console.error(
        "UPDATE LESSON SERVICE ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to update lesson.",
      };
    }
  }

  static async updateStatus(
    id: string,
    courseId: string,
    organizationId: string,
    branchId: string,
    status:
      | "DRAFT"
      | "PUBLISHED"
      | "ARCHIVED",
    updatedById?: string,
  ) {
    try {
      const result =
        await LessonRepository.updateStatus(
          id,
          courseId,
          organizationId,
          branchId,
          status,
          updatedById,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Lesson not found.",
        };
      }

      return {
        success: true,
        message:
          status === "PUBLISHED"
            ? "Lesson published successfully."
            : status === "ARCHIVED"
              ? "Lesson archived successfully."
              : "Lesson moved to draft.",
      };
    } catch (error) {
      console.error(
        "UPDATE LESSON STATUS SERVICE ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to update lesson status.",
      };
    }
  }

  static async softDelete(
    id: string,
    courseId: string,
    organizationId: string,
    branchId: string,
    updatedById?: string,
  ) {
    try {
      const result =
        await LessonRepository.softDelete(
          id,
          courseId,
          organizationId,
          branchId,
          updatedById,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Lesson not found.",
        };
      }

      return {
        success: true,
        message: "Lesson deleted successfully.",
      };
    } catch (error) {
      console.error(
        "DELETE LESSON SERVICE ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to delete lesson.",
      };
    }
  }

  static async reorder(
    courseId: string,
    organizationId: string,
    branchId: string,
    lessonId: string,
    order: number,
  ) {
    try {
      await LessonRepository.reorder(
        courseId,
        organizationId,
        branchId,
        lessonId,
        order,
      );

      return {
        success: true,
        message: "Lesson order updated successfully.",
      };
    } catch (error) {
      console.error(
        "REORDER LESSON SERVICE ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to reorder lesson.",
      };
    }
  }
}
