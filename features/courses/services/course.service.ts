import { Prisma } from "@prisma/client";

import { CourseRepository } from "../repository/course.repository";

import type {
  CreateCourseRepositoryData,
  UpdateCourseRepositoryData,
} from "../types";

export class CourseService {
  static async create(data: CreateCourseRepositoryData) {
    try {
      await CourseRepository.create(data);

      return {
        success: true,
        message: "Course created successfully.",
      };
    } catch (error) {
      console.error("CourseService.create:", error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          success: false,
          message: "A course with this code already exists.",
        };
      }

      return {
        success: false,
        message: "Failed to create course.",
      };
    }
  }

  static async getAll(
    organizationId: string,
    branchId?: string,
    search?: string,
    page = 1,
    limit = 10,
  ) {
    return CourseRepository.findAll(
      organizationId,
      branchId,
      search,
      page,
      limit,
    );
  }

  static async getAvailableForStudent(
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return CourseRepository.findAvailableForStudent(
      studentId,
      organizationId,
      branchId,
    );
  }

  static async getById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return CourseRepository.findById(
      id,
      organizationId,
      branchId,
    );
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string | null,
    data: UpdateCourseRepositoryData,
  ) {
    try {
      const result = await CourseRepository.update(
        id,
        organizationId,
        branchId,
        data,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Course not found.",
        };
      }

      return {
        success: true,
        message: "Course updated successfully.",
      };
    } catch (error) {
      console.error("CourseService.update:", error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          success: false,
          message: "A course with this code already exists.",
        };
      }

      return {
        success: false,
        message: "Failed to update course.",
      };
    }
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId: string | null,
    updatedById: string,
  ) {
    try {
      const result = await CourseRepository.softDelete(
        id,
        organizationId,
        branchId,
        updatedById,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Course not found.",
        };
      }

      return {
        success: true,
        message: "Course deleted successfully.",
      };
    } catch (error) {
      console.error("CourseService.softDelete:", error);

      return {
        success: false,
        message: "Failed to delete course.",
      };
    }
  }
}
