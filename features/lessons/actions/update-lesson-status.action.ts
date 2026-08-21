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

  
  return LessonService.updateStatus(
    id,
    courseId,
    session.user.organizationId,
    session.user.branchId,
    status,
    session.user.id,
  );
}
