"use server";

import { requireStudent } from "@/features/auth/authorization";
import { StudentService } from "@/features/students/services/student.service";

import { LessonProgressService } from "../services/lesson-progress.service";

export async function getStudentCourseLessonsAction(
  courseId: string,
) {
  const session = await requireStudent();

  
  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    return {
      success: false,
      message: "Student profile not found.",
    };
  }

  return LessonProgressService.getCourseLessons(
    student.id,
    courseId,
    session.user.organizationId,
    session.user.branchId,
  );
}
