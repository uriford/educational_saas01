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

  
  return LessonService.update(
    id,
    courseId,
    session.user.organizationId,
    session.user.branchId,
    data,
    session.user.id,
  );
}
