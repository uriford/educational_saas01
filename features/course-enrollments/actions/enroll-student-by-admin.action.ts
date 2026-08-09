"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { CourseService } from "@/features/courses/services/course.service";
import { CourseEnrollmentService } from "../services/course-enrollment.service";

export async function enrollStudentByAdminAction(
  studentId: string,
  courseId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.BRANCH_ADMIN,
  ];

  if (!allowedRoles.includes(session.user.role)) {
    return {
      success: false,
      message: "You are not allowed to enroll students.",
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization information is missing.",
    };
  }

  const course = await CourseService.getById(
    courseId,
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );

  if (!course) {
    return {
      success: false,
      message: "Course not found.",
    };
  }

  const student = await StudentService.getById(
    studentId,
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );

  if (!student) {
    return {
      success: false,
      message: "Student not found.",
    };
  }

  return CourseEnrollmentService.enroll(
    student.id,
    course.id,
  );
}
