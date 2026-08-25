import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { EnrollmentRepository } from "../repository/enrollment.repository";
import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";

type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED" | "SUSPENDED";

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
    actorId?: string,
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

      const existing = await EnrollmentRepository.findByStudentAndCourse(
        data.studentId,
        data.courseId,
        organizationId,
        branchId,
      );

      if (existing) {
        return {
          success: false,
          message: "Student is already enrolled in this course.",
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
            message: "This course has reached its capacity.",
          };
        }
      }

      const enrollment = await EnrollmentRepository.create({
        studentId: data.studentId,
        courseId: data.courseId,
      });

      await db.auditLog.create({
        data: {
          organizationId,
          branchId: student.branchId,
          userId: actorId ?? null,
          action: "CREATE",
          entityType: "CourseEnrollment",
          entityId: enrollment.id,
          description: `Student ${student.studentId} enrolled in ${course.name}.`,
        },
      });

      await NotificationAutomationService.notifyStudent({
        studentId: student.id,
        organizationId,
        type: "SUCCESS",
        title: "Enrollment confirmed",
        message: `You have been successfully enrolled in ${course.name}.`,
        href: `/student/courses/${course.id}`,
        dedupeKey: `student-enrollment-created:${enrollment.id}`,
      });

      return {
        success: true,
        message: "Student enrolled successfully.",
        enrollment,
      };
    } catch (error) {
      console.error("CREATE ENROLLMENT ERROR:", error);

      return {
        success: false,
        message: "Failed to create enrollment.",
      };
    }
  }

  static async getById(id: string, organizationId: string, branchId?: string) {
    return EnrollmentRepository.findById(id, organizationId, branchId);
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
    const enrollments =
      await EnrollmentRepository.findByStudent(
        studentId,
        organizationId,
        branchId,
      );

    /*
     * CourseEnrollment.progress is a cached value.
     * Recalculate it before returning student enrollments so
     * the student UI always receives authoritative progress.
     */
    const { CourseProgressService } =
      await import(
        "@/features/courses/services/course-progress.service"
      );

    return Promise.all(
      enrollments.map(async (enrollment) => {
        const result =
          await CourseProgressService.calculate(
            enrollment.id,
          );

        const nextStatus: Prisma.CourseEnrollmentGetPayload<{
          select: { status: true };
        }>["status"] =
          result.progress >= 100
            ? enrollment.status === "DROPPED" ||
              enrollment.status === "SUSPENDED"
              ? enrollment.status
              : "COMPLETED"
            : enrollment.status === "COMPLETED"
              ? "ACTIVE"
              : enrollment.status;

        return {
          ...enrollment,
          progress: result.progress,
          status: nextStatus,
        };
      }),
    );
  }

  static async update(
    id: string,
    data: UpdateEnrollmentInput,
    organizationId: string,
    branchId?: string,
    actorId?: string,
  ) {
    try {
      if (data.progress < 0 || data.progress > 100) {
        return {
          success: false,
          message: "Progress must be between 0 and 100.",
        };
      }

      const enrollment = await EnrollmentRepository.findById(
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

      const normalizedProgress = Math.min(
        100,
        Math.max(0, Math.round(data.progress)),
      );

      const finalStatus =
        normalizedProgress >= 100
          ? "COMPLETED"
          : data.status === "COMPLETED"
            ? "ACTIVE"
            : data.status;

      const finalProgress =
        finalStatus === "COMPLETED"
          ? 100
          : normalizedProgress;

      const result = await db.courseEnrollment.updateMany({
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
          status: finalStatus,
          progress: finalProgress,
          completedAt:
            finalStatus === "COMPLETED"
              ? new Date()
              : null,
        },
      });

      if (result.count === 0) {
        return {
          success: false,
          message: "Enrollment not found.",
        };
      }

      await db.auditLog.create({
        data: {
          organizationId,
          branchId: branchId ?? null,
          userId: actorId ?? null,
          action: "UPDATE",
          entityType: "CourseEnrollment",
          entityId: id,
          description: `Enrollment updated: status ${finalStatus}, progress ${finalProgress}%.`,
        },
      });

      await NotificationAutomationService.notifyStudent({
        studentId: enrollment.studentId,
        organizationId,
        type:
          finalStatus === "COMPLETED"
            ? "SUCCESS"
            : "STUDENT",
        title:
          finalStatus === "COMPLETED"
            ? "Course completed"
            : "Enrollment updated",
        message:
          finalStatus === "COMPLETED"
            ? "Congratulations! Your course enrollment has been marked as completed."
            : `Your enrollment status is now ${finalStatus}. Your progress is ${finalProgress}%.`,
        href: `/student/courses/${enrollment.courseId}`,
        dedupeKey: `student-enrollment-updated:${id}:${finalStatus}:${finalProgress}`,
      });

      return {
        success: true,
        message: "Enrollment updated successfully.",
      };
    } catch (error) {
      console.error("UPDATE ENROLLMENT ERROR:", error);

      return {
        success: false,
        message: "Failed to update enrollment.",
      };
    }
  }

  static async updateStatus(
    id: string,
    organizationId: string,
    branchId: string | undefined,
    status: EnrollmentStatus,
    actorId?: string,
  ) {
    try {
      const enrollment = await EnrollmentRepository.findById(
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

      const result = await EnrollmentRepository.updateStatus(
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

      await db.auditLog.create({
        data: {
          organizationId,
          branchId: branchId ?? null,
          userId: actorId ?? null,
          action: "UPDATE",
          entityType: "CourseEnrollment",
          entityId: id,
          description: `Enrollment status changed to ${status}.`,
        },
      });

      await NotificationAutomationService.notifyAdmins({
        organizationId,
        branchId,
        actorId,
        type: "STUDENT",
        title: "Enrollment status updated",
        message: `An enrollment status was changed to ${status}.`,
        href: `/students/${enrollment.studentId}`,
        dedupeKey: `enrollment-status:${id}:${Date.now()}`,
      });

      return {
        success: true,
        message: "Enrollment status updated successfully.",
      };
    } catch (error) {
      console.error("UPDATE ENROLLMENT STATUS ERROR:", error);

      return {
        success: false,
        message: "Failed to update enrollment status.",
      };
    }
  }

  static async delete(id: string, organizationId: string, branchId?: string) {
    try {
      const enrollment = await EnrollmentRepository.findById(
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

      const result = await EnrollmentRepository.delete(
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
        message: "Enrollment removed successfully.",
      };
    } catch (error) {
      console.error("DELETE ENROLLMENT ERROR:", error);

      return {
        success: false,
        message: "Failed to remove enrollment.",
      };
    }
  }
}
