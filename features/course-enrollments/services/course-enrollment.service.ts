import { db } from "@/lib/db";

import { CourseEnrollmentRepository } from "../repository/course-enrollment.repository";

export class CourseEnrollmentService {
  static async enroll(
    studentId: string,
    courseId: string,
  ) {
    try {
      const student = await db.student.findFirst({
        where: {
          id: studentId,
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
          id: courseId,
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

      if (
        course.branchId !== student.branchId ||
        course.organizationId !== student.organizationId
      ) {
        return {
          success: false,
          message:
            "Student and course belong to different organizations or branches.",
        };
      }

      const existingEnrollment =
        await CourseEnrollmentRepository.findByStudentAndCourse(
          studentId,
          courseId,
        );

      if (existingEnrollment) {
        if (existingEnrollment.status === "DROPPED") {
          return {
            success: false,
            message:
              "This student previously dropped this course. Re-enrollment is not available yet.",
          };
        }

        return {
          success: false,
          message: "Student is already enrolled in this course.",
        };
      }

      const enrollment =
        await CourseEnrollmentRepository.create(
          studentId,
          courseId,
        );

      return {
        success: true,
        message: "Student enrolled successfully.",
        enrollment,
      };
    } catch (error) {
      console.error("ENROLL STUDENT ERROR:", error);

      return {
        success: false,
        message: "Failed to enroll student.",
      };
    }
  }

  static async enrollByAdmin(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    try {
      const student = await db.student.findFirst({
        where: {
          id: studentId,
          organizationId,
          ...(branchId && { branchId }),
          deletedAt: null,
          status: "ACTIVE",
        },
      });

      if (!student) {
        return {
          success: false,
          message: "Student not found or not accessible.",
        };
      }

      const course = await db.course.findFirst({
        where: {
          id: courseId,
          organizationId,
          ...(branchId && { branchId }),
          deletedAt: null,
        },
      });

      if (!course) {
        return {
          success: false,
          message: "Course not found or not accessible.",
        };
      }

      if (course.status !== "ACTIVE") {
        return {
          success: false,
          message: "This course is not currently active.",
        };
      }

      const existingEnrollment =
        await CourseEnrollmentRepository.findByStudentAndCourse(
          studentId,
          courseId,
        );

      if (existingEnrollment) {
        if (existingEnrollment.status === "DROPPED") {
          return {
            success: false,
            message:
              "This student previously dropped this course. Re-enrollment is not available yet.",
          };
        }

        return {
          success: false,
          message: "Student is already enrolled in this course.",
        };
      }

      if (course.capacity !== null) {
        const enrolledCount =
          await db.courseEnrollment.count({
            where: {
              courseId,
              status: {
                in: ["ACTIVE", "SUSPENDED"],
              },
            },
          });

        if (enrolledCount >= course.capacity) {
          return {
            success: false,
            message: "This course has reached its capacity.",
          };
        }
      }

      const enrollment =
        await CourseEnrollmentRepository.create(
          studentId,
          courseId,
        );

      return {
        success: true,
        message: "Student enrolled successfully.",
        enrollment,
      };
    } catch (error) {
      console.error("ADMIN ENROLL STUDENT ERROR:", error);

      return {
        success: false,
        message: "Failed to enroll student.",
      };
    }
  }

  static async getStudentCourses(
    studentId: string,
  ) {
    return CourseEnrollmentRepository.findStudentCourses(
      studentId,
    );
  }

  static async removeEnrollment(
    enrollmentId: string,
    studentId: string,
  ) {
    try {
      const enrollment =
        await CourseEnrollmentRepository.findById(
          enrollmentId,
        );

      if (!enrollment) {
        return {
          success: false,
          message: "Enrollment not found.",
        };
      }

      if (enrollment.studentId !== studentId) {
        return {
          success: false,
          message:
            "You are not allowed to remove this enrollment.",
        };
      }

      await CourseEnrollmentRepository.delete(
        enrollmentId,
      );

      return {
        success: true,
        message: "Enrollment removed successfully.",
      };
    } catch (error) {
      console.error(
        "REMOVE ENROLLMENT ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to remove enrollment.",
      };
    }
  }

  static async getCourseStudents(courseId: string) {
    return CourseEnrollmentRepository.findCourseStudents(
      courseId,
    );
  }
}