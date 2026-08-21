"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { LessonService } from "../services/lesson.service";

type ReorderItem = {
  lessonId: string;
  order: number;
};

export async function reorderLessonsAction(
  courseId: string,
  items: ReorderItem[],
) {
  const session = await requireAdmin();

  
  try {
    for (const item of items) {
      const result = await LessonService.reorder(
        courseId,
        session.user.organizationId,
        session.user.branchId,
        item.lessonId,
        item.order,
      );

      if (!result.success) {
        return result;
      }
    }

    return {
      success: true,
      message: "Lesson order updated successfully.",
    };
  } catch (error) {
    console.error(
      "REORDER LESSONS ACTION ERROR:",
      error,
    );

    return {
      success: false,
      message: "Failed to reorder lessons.",
    };
  }
}
