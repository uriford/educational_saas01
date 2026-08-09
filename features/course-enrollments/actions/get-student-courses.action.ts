"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";

import { CourseEnrollmentService } from "../services/course-enrollment.service";

export async function getStudentCoursesAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
      courses: [],
    };
  }

  if (session.user.role !== ROLES.STUDENT) {
    return {
      success: false,
      message: "Only students can access their courses.",
      courses: [],
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization information is missing.",
      courses: [],
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
      courses: [],
    };
  }

  const courses =
    await CourseEnrollmentService.getStudentCourses(
      student.id,
    );

  return {
    success: true,
    message: "Student courses fetched successfully.",
    courses,
  };
}
