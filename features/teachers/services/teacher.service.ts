import { TeacherRepository } from "../repository/teacher.repository";

import type { CreateTeacherData } from "../types";

export class TeacherService {
static async create(data: CreateTeacherData) {
  try {
    await this.createWithGeneratedId(data);

    return {
      success: true,
      message: "Teacher created successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to create teacher.",
    };
  }
}

static async createWithGeneratedId(
  data: CreateTeacherData,
) {
  const teacherId = await this.generateTeacherId();

  return TeacherRepository.create({
    ...data,
    teacherId,
  });
}

static async generateTeacherId() {
  const totalTeachers =
    await TeacherRepository.count();

  return `TCH-${String(totalTeachers + 1).padStart(6, "0")}`;
}

  static async getAll(
    organizationId: string,
    branchId?: string,
    search?: string,
    page = 1,
    limit = 10,
  ) {
    return TeacherRepository.findAll(
      organizationId,
      branchId,
      search,
      page,
      limit,
    );
  }

  static async getById(id: string, organizationId: string, branchId?: string) {
    return TeacherRepository.findById(id, organizationId, branchId);
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string,
    data: Partial<CreateTeacherData>,
  ) {
    try {
      const result = await TeacherRepository.update(
        id,
        organizationId,
        branchId,
        data,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Teacher not found.",
        };
      }

      return {
        success: true,
        message: "Teacher updated successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to update teacher.",
      };
    }
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const result = await TeacherRepository.softDelete(
        id,
        organizationId,
        branchId,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Teacher not found.",
        };
      }

      return {
        success: true,
        message: "Teacher deleted successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to delete teacher.",
      };
    }
  }
}
