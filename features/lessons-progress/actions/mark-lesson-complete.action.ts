"use server";

import { requireStudent } from "@/features/auth/authorization";
import { StudentService } from "@/features/students/services/student.service";

import { LessonProgressService } from "../services/lesson-progress.service";

export async function markLessonCompleteAction(
  courseId: string,
  lessonId: string,
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

  return LessonProgressService.markComplete(
    student.id,
    courseId,
    lessonId,
    session.user.organizationId,
    session.user.branchId,
  );
}
