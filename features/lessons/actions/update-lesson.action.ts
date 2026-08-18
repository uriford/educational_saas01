"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { LessonService } from "../services/lesson.service";
import type { UpdateLessonData } from "../types";

export async function updateLessonAction(
  id: string,
  courseId: string,
  data: UpdateLessonData,
) {
  const session = await requireAdmin();

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    return {
      success: false,
      message: "Organization or Branch not found.",
    };
  }

  return LessonService.update(
    id,
    courseId,
    session.user.organizationId,
    session.user.branchId,
    data,
    session.user.id,
  );
}
