"use server";

import { requireStudent } from "@/features/auth/authorization";

import { LessonProgressService } from "../services/lesson-progress.service";

export async function markLessonCompleteAction(
  courseId: string,
  lessonId: string,
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

  return LessonProgressService.markComplete(
    session.user.id,
    courseId,
    lessonId,
    session.user.organizationId,
    session.user.branchId,
  );
}
