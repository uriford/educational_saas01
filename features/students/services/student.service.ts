import { StudentRepository } from "../repository/student.repository";
import type { CreateStudentData } from "../types";
import bcrypt from "bcrypt";

type CreateStudentResponse =
  | {
      success: true;
      message: string;
      student: Awaited<
        ReturnType<typeof StudentRepository.createWithGeneratedId>
      >;
    }
  | {
      success: false;
      message: string;
    };

export class StudentService {
  static async create(data: CreateStudentData): Promise<CreateStudentResponse> {
    try {
      if (data.email?.trim()) {
        const existingStudent = await StudentRepository.findByEmail(
          data.email,
          data.organizationId,
        );

        if (existingStudent) {
          return {
            success: false,
            message: "A student with this email already exists.",
          };
        }

        const temporaryPassword = `Student@${Math.random()
          .toString(36)
          .slice(-8)}`;

        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        const student = await StudentRepository.createWithGeneratedId(
          {
            ...data,
            email: data.email.trim(),
          },
          {
            code: `STU-${Date.now()}`,
            password: hashedPassword,
          },
        );

        return {
          success: true,
          message: `Student created successfully. Temporary password: ${temporaryPassword}`,
          student,
        };
      }

      const student = await StudentRepository.createWithGeneratedId(data);

      return {
        success: true,
        message: "Student created successfully.",
        student,
      };
    } catch (error) {
      console.error("CREATE STUDENT ERROR:", error);

      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: "Failed to create student.",
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
    return StudentRepository.findAll(
      organizationId,
      branchId,
      search,
      page,
      limit,
    );
  }

  static async getById(id: string, organizationId: string, branchId?: string) {
    return StudentRepository.findById(id, organizationId, branchId);
  }

  static async getByUserId(
    userId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return StudentRepository.findByUserId(userId, organizationId, branchId);
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string | undefined,
    data: CreateStudentData,
  ) {
    try {
      if (data.email) {
        const existingStudent = await StudentRepository.findByEmail(
          data.email,
          organizationId,
        );

        if (existingStudent && existingStudent.id !== id) {
          return {
            success: false,
            message: "A student with this email already exists.",
          };
        }
      }

      const result = await StudentRepository.update(
        id,
        organizationId,
        branchId,
        data,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Student not found.",
        };
      }

      return {
        success: true,
        message: "Student updated successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to update student.",
      };
    }
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const result = await StudentRepository.softDelete(
        id,
        organizationId,
        branchId,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Student not found.",
        };
      }

      return {
        success: true,
        message: "Student deleted successfully.",
      };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        message: "Failed to delete student.",
      };
    }
  }

  static async getStatistics(organizationId: string, branchId?: string) {
    return StudentRepository.getStatistics(organizationId, branchId);
  }
}
