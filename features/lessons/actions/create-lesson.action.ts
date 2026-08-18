"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { LessonService } from "../services/lesson.service";
import type { CreateLessonData } from "../types";

export async function createLessonAction(
  data: CreateLessonData,
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

  return LessonService.create({
    ...data,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
    createdById: session.user.id,
  });
}
