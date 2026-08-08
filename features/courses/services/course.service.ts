import { CourseRepository } from "../repository/course.repository";

import type {
  CreateCourseData,
  CreateCourseRepositoryData,
  UpdateCourseData,
} from "../types";
import { CourseSchedulerService } from "./course-sheduler.service";

export class CourseService {
  static async create(data: CreateCourseRepositoryData) {
    try {
      await CourseRepository.create(data);

      return {
        success: true,
        message: "Course created successfully.",
      };
    } catch (error) {
      console.error(error);

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
    branchId: string,
    data: UpdateCourseData,
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
      console.error(error);

      return {
        success: false,
        message: "Failed to update course.",
      };
    }
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const result = await CourseRepository.softDelete(
        id,
        organizationId,
        branchId,
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
      console.error(error);

      return {
        success: false,
        message: "Failed to delete course.",
      };
    }
  }
}