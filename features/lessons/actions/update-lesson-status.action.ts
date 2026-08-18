"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { LessonService } from "../services/lesson.service";
import type { LessonStatus } from "../types";

export async function updateLessonStatusAction(
  id: string,
  courseId: string,
  status: LessonStatus,
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

  return LessonService.updateStatus(
    id,
    courseId,
    session.user.organizationId,
    session.user.branchId,
    status,
    session.user.id,
  );
}
