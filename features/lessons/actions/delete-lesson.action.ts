"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { LessonService } from "../services/lesson.service";

export async function deleteLessonAction(
  id: string,
  courseId: string,
) {
  const session = await requireAdmin();

  
  return LessonService.softDelete(
    id,
    courseId,
    session.user.organizationId,
    session.user.branchId,
    session.user.id,
  );
}
