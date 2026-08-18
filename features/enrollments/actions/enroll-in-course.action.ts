"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { EnrollmentService } from "../services/enrollment.service";

export async function enrollInCourseAction(courseId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to enroll.",
      };
    }

    if (session.user.role !== ROLES.STUDENT) {
      return {
        success: false,
        message: "Only students can enroll themselves in courses.",
      };
    }

    if (!session.user.organizationId) {
      return {
        success: false,
        message: "Organization context is missing.",
      };
    }

    const student = await StudentService.getByUserId(
      session.user.id,
      session.user.organizationId,
      session.user.branchId ?? undefined,
    );

    if (!student) {
      return {
        success: false,
        message: "Student profile not found.",
      };
    }

    return EnrollmentService.create(
      {
        studentId: student.id,
        courseId,
      },
      session.user.organizationId,
      session.user.branchId ?? undefined,
      session.user.id,
    );
  } catch (error) {
    console.error("STUDENT SELF ENROLLMENT ERROR:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to enroll in course.",
    };
  }
}
