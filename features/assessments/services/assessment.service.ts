import { db } from "@/lib/db";

import { AssessmentRepository } from "../repository/assessment.repository";

export class AssessmentService {
  static async create(data: {
    organizationId: string;
    branchId: string;
    courseId: string;
    title: string;
    description?: string | null;
    duration?: number | null;
    totalMarks: number;
    passingMarks: number;
    maxAttempts: number;
    status?:
      | "DRAFT"
      | "PUBLISHED"
      | "CLOSED"
      | "ARCHIVED";
    startDate?: Date | null;
    endDate?: Date | null;
    createdById?: string;
  }) {
    try {
      if (!data.title.trim()) {
        return {
          success: false,
          message: "Assessment title is required.",
        };
      }

      if (data.totalMarks <= 0) {
        return {
          success: false,
          message: "Total marks must be greater than zero.",
        };
      }

      if (data.passingMarks < 0) {
        return {
          success: false,
          message: "Passing marks cannot be negative.",
        };
      }

      if (data.maxAttempts < 1) {
        return {
          success: false,
          message: "Maximum attempts must be at least 1.",
        };
      }

      if (data.passingMarks > data.totalMarks) {
        return {
          success: false,
          message:
            "Passing marks cannot be greater than total marks.",
        };
      }

      if (
        data.duration !== undefined &&
        data.duration !== null &&
        data.duration <= 0
      ) {
        return {
          success: false,
          message: "Duration must be greater than zero.",
        };
      }

      if (
        data.startDate &&
        data.endDate &&
        data.startDate >= data.endDate
      ) {
        return {
          success: false,
          message:
            "Assessment end date must be after start date.",
        };
      }

      const course = await db.course.findFirst({
        where: {
          id: data.courseId,
          organizationId: data.organizationId,
          branchId: data.branchId,
          deletedAt: null,
        },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found.",
        };
      }

      const assessment =
        await AssessmentRepository.create({
          ...data,
          title: data.title.trim(),
          description:
            data.description?.trim() || null,
        });

      return {
        success: true,
        message: "Assessment created successfully.",
        assessment,
      };
    } catch (error) {
      console.error(
        "CREATE ASSESSMENT ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to create assessment.",
      };
    }
  }

  static async update(data: {
    id: string;
    organizationId: string;
    branchId: string;
    title?: string;
    description?: string | null;
    duration?: number | null;
    totalMarks?: number;
    passingMarks?: number;
    maxAttempts?: number;
    status?:
      | "DRAFT"
      | "PUBLISHED"
      | "CLOSED"
      | "ARCHIVED";
    startDate?: Date | null;
    endDate?: Date | null;
    updatedById?: string;
  }) {
    try {
      const existing =
        await AssessmentRepository.findById(
          data.id,
          data.organizationId,
          data.branchId,
        );

      if (!existing) {
        return {
          success: false,
          message: "Assessment not found.",
        };
      }

      const totalMarks =
        data.totalMarks ??
        Number(existing.totalMarks);

      const passingMarks =
        data.passingMarks ??
        Number(existing.passingMarks);

      const maxAttempts =
        data.maxAttempts ??
        Number(existing.maxAttempts);

      if (data.title !== undefined && !data.title.trim()) {
        return {
          success: false,
          message: "Assessment title is required.",
        };
      }

      if (totalMarks <= 0) {
        return {
          success: false,
          message:
            "Total marks must be greater than zero.",
        };
      }

      if (passingMarks < 0) {
        return {
          success: false,
          message:
            "Passing marks cannot be negative.",
        };
      }

      if (maxAttempts < 1) {
        return {
          success: false,
          message: "Maximum attempts must be at least 1.",
        };
      }

      if (passingMarks > totalMarks) {
        return {
          success: false,
          message:
            "Passing marks cannot be greater than total marks.",
        };
      }

      if (
        data.duration !== undefined &&
        data.duration !== null &&
        data.duration <= 0
      ) {
        return {
          success: false,
          message:
            "Duration must be greater than zero.",
        };
      }

      if (
        data.startDate &&
        data.endDate &&
        data.startDate >= data.endDate
      ) {
        return {
          success: false,
          message:
            "Assessment end date must be after start date.",
        };
      }

      const result =
        await AssessmentRepository.update(
          data.id,
          data.organizationId,
          data.branchId,
          {
            title: data.title?.trim(),
            description: data.description,
            duration: data.duration,
            totalMarks: data.totalMarks,
            passingMarks: data.passingMarks,
            maxAttempts: data.maxAttempts,
            status: data.status,
            startDate: data.startDate,
            endDate: data.endDate,
            updatedById: data.updatedById,
          },
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Assessment not found.",
        };
      }

      return {
        success: true,
        message: "Assessment updated successfully.",
      };
    } catch (error) {
      console.error(
        "UPDATE ASSESSMENT ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to update assessment.",
      };
    }
  }

  static async getById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return AssessmentRepository.findById(
      id,
      organizationId,
      branchId,
    );
  }

  static async getAll(
    organizationId: string,
    branchId?: string,
  ) {
    return AssessmentRepository.findAll(
      organizationId,
      branchId,
    );
  }

  static async getCourseAssessments(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return AssessmentRepository.findByCourse(
      courseId,
      organizationId,
      branchId,
    );
  }

  static async delete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const result =
        await AssessmentRepository.softDelete(
          id,
          organizationId,
          branchId,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Assessment not found.",
        };
      }

      return {
        success: true,
        message: "Assessment deleted successfully.",
      };
    } catch (error) {
      console.error(
        "DELETE ASSESSMENT ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to delete assessment.",
      };
    }
  }
}