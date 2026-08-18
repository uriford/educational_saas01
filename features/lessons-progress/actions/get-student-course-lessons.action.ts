"use server";

import { requireStudent } from "@/features/auth/authorization";

import { LessonProgressService } from "../services/lesson-progress.service";

export async function getStudentCourseLessonsAction(
  courseId: string,
) {
  const session = await requireStudent();

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    return {
      success: false,
      message: "Organization or Branch not found.",
    };
  }

  return LessonProgressService.getCourseLessons(
    session.user.id,
    courseId,
    session.user.organizationId,
    session.user.branchId,
  );
}
