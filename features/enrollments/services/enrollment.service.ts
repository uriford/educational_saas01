import { db } from "@/lib/db";
import { EnrollmentRepository } from "../repository/enrollment.repository";

type EnrollmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "DROPPED"
  | "SUSPENDED";

type CreateEnrollmentInput = {
  studentId: string;
  courseId: string;
};

type UpdateEnrollmentInput = {
  status: EnrollmentStatus;
  progress: number;
};

export class EnrollmentService {
  static async create(
    data: CreateEnrollmentInput,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const student = await db.student.findFirst({
        where: {
          id: data.studentId,
          organizationId,
          ...(branchId && { branchId }),
          deletedAt: null,
        },
      });

      if (!student) {
        return {
          success: false,
          message: "Student not found.",
        };
      }

      const course = await db.course.findFirst({
        where: {
          id: data.courseId,
          organizationId,
          ...(branchId && { branchId }),
          deletedAt: null,
        },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found.",
        };
      }

      if (course.status !== "ACTIVE") {
        return {
          success: false,
          message: "This course is not currently active.",
        };
      }

      const existing =
        await EnrollmentRepository.findByStudentAndCourse(
          data.studentId,
          data.courseId,
          organizationId,
          branchId,
        );

      if (existing) {
        return {
          success: false,
          message:
            "Student is already enrolled in this course.",
        };
      }

      if (course.capacity !== null) {
        const activeEnrollments =
          await EnrollmentRepository.countActiveByCourse(
            data.courseId,
            organizationId,
            branchId,
          );

        if (activeEnrollments >= course.capacity) {
          return {
            success: false,
            message:
              "This course has reached its capacity.",
          };
        }
      }

      const enrollment =
        await EnrollmentRepository.create({
          studentId: data.studentId,
          courseId: data.courseId,
        });

      return {
        success: true,
        message: "Student enrolled successfully.",
        enrollment,
      };
    } catch (error) {
      console.error(
        "CREATE ENROLLMENT ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to create enrollment.",
      };
    }
  }

  static async getById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return EnrollmentRepository.findById(
      id,
      organizationId,
      branchId,
    );
  }

  static async getCourseEnrollments(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return EnrollmentRepository.findByCourse(
      courseId,
      organizationId,
      branchId,
    );
  }

  static async getStudentEnrollments(
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return EnrollmentRepository.findByStudent(
      studentId,
      organizationId,
      branchId,
    );
  }

  static async update(
    id: string,
    data: UpdateEnrollmentInput,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      if (
        data.progress < 0 ||
        data.progress > 100
      ) {
        return {
          success: false,
          message:
            "Progress must be between 0 and 100.",
        };
      }

      const enrollment =
        await EnrollmentRepository.findById(
          id,
          organizationId,
          branchId,
        );

      if (!enrollment) {
        return {
          success: false,
          message: "Enrollment not found.",
        };
      }

      const result =
        await db.courseEnrollment.updateMany({
          where: {
            id,
            course: {
              organizationId,
              ...(branchId && {
                branchId,
              }),
            },
          },
          data: {
            status: data.status,
            progress: data.progress,
            ...(data.status === "COMPLETED"
              ? {
                  completedAt: new Date(),
                }
              : {}),
          },
        });

      if (result.count === 0) {
        return {
          success: false,
          message: "Enrollment not found.",
        };
      }

      return {
        success: true,
        message:
          "Enrollment updated successfully.",
      };
    } catch (error) {
      console.error(
        "UPDATE ENROLLMENT ERROR:",
        error,
      );

      return {
        success: false,
        message:
          "Failed to update enrollment.",
      };
    }
  }

  static async updateStatus(
    id: string,
    organizationId: string,
    branchId: string | undefined,
    status: EnrollmentStatus,
  ) {
    try {
      const enrollment =
        await EnrollmentRepository.findById(
          id,
          organizationId,
          branchId,
        );

      if (!enrollment) {
        return {
          success: false,
          message: "Enrollment not found.",
        };
      }

      const result =
        await EnrollmentRepository.updateStatus(
          id,
          organizationId,
          branchId,
          status,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Enrollment not found.",
        };
      }

      return {
        success: true,
        message:
          "Enrollment status updated successfully.",
      };
    } catch (error) {
      console.error(
        "UPDATE ENROLLMENT STATUS ERROR:",
        error,
      );

      return {
        success: false,
        message:
          "Failed to update enrollment status.",
      };
    }
  }

  static async delete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const enrollment =
        await EnrollmentRepository.findById(
          id,
          organizationId,
          branchId,
        );

      if (!enrollment) {
        return {
          success: false,
          message: "Enrollment not found.",
        };
      }

      const result =
        await EnrollmentRepository.delete(
          id,
          organizationId,
          branchId,
        );

      if (result.count === 0) {
        return {
          success: false,
          message: "Enrollment not found.",
        };
      }

      return {
        success: true,
        message:
          "Enrollment removed successfully.",
      };
    } catch (error) {
      console.error(
        "DELETE ENROLLMENT ERROR:",
        error,
      );

      return {
        success: false,
        message:
          "Failed to remove enrollment.",
      };
    }
  }
}
