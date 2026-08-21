import { StudentRepository } from "../repository/student.repository";
import type { CreateStudentData } from "../types";
import { db } from "@/lib/db";

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
      const normalizedEmail = data.email?.trim().toLowerCase();

      if (normalizedEmail) {
        // Student.email is unique for the organization.
        const existingStudent = await StudentRepository.findByEmail(
          normalizedEmail,
          data.organizationId,
        );

        if (existingStudent) {
          return {
            success: false,
            message: "A student with this email already exists.",
          };
        }

        // User email uniqueness is scoped to the organization.
        // The same email may exist in different organizations.
        const existingUser = await db.user.findFirst({
          where: {
            email: normalizedEmail,
            organizationId: data.organizationId,
          },
          select: {
            id: true,
            email: true,
            role: true,
            organizationId: true,
            deletedAt: true,
          },
        });

        if (existingUser) {
          return {
            success: false,
            message:
              "This email address is already associated with another account in this organization.",
          };
        }
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

  static async updateOwnAvatar(
    id: string,
    userId: string,
    organizationId: string,
    branchId?: string,
    avatar: string = "",
  ) {
    try {
      const result = await StudentRepository.updateOwnAvatar(
        id,
        userId,
        organizationId,
        branchId,
        avatar,
      );

      console.log("========== STUDENT AVATAR DB UPDATE ==========");
      console.log({
        id,
        userId,
        organizationId,
        branchId,
        avatar,
        updatedCount: result.count,
      });

      if (result.count === 0) {
        return {
          success: false,
          message: "Student profile not found.",
        };
      }

      return {
        success: true,
        message: "Profile photo updated successfully.",
      };
    } catch (error) {
      console.error("UPDATE OWN AVATAR SERVICE ERROR:", error);

      return {
        success: false,
        message: "Failed to update profile photo.",
      };
    }
  }

  static async removeOwnAvatar(
    id: string,
    userId: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const result = await StudentRepository.removeOwnAvatar(
        id,
        userId,
        organizationId,
        branchId,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Student profile not found.",
        };
      }

      return {
        success: true,
        message: "Profile photo removed successfully.",
      };
    } catch (error) {
      console.error("REMOVE OWN AVATAR SERVICE ERROR:", error);

      return {
        success: false,
        message: "Failed to remove profile photo.",
      };
    }
  }

  static async updateOwnProfile(
    id: string,
    userId: string,
    organizationId: string,
    data: {
      firstName: string;
      lastName?: string;
      phone?: string;
      gender?: "MALE" | "FEMALE" | "OTHER";
      dateOfBirth?: string;
      address?: string;
      guardianName?: string;
      guardianPhone?: string;
      guardianEmail?: string;
    },
    branchId?: string,
  ) {
    try {
      const result = await StudentRepository.updateOwnProfile(
        id,
        userId,
        organizationId,
        data,
        branchId,
      );

      if (result.count === 0) {
        return {
          success: false,
          message: "Student profile not found.",
        };
      }

      return {
        success: true,
        message: "Profile updated successfully.",
      };
    } catch (error) {
      console.error("UPDATE OWN STUDENT PROFILE ERROR:", error);

      return {
        success: false,
        message: "Failed to update profile.",
      };
    }
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
