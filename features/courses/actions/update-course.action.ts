"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { updateCourseSchema } from "../schemas/course.schema";
import { CourseService } from "../services/course.service";

export async function updateCourseAction(
  id: string,
  data: unknown,
) {
  const session = await requireAdmin();

  
  if (!id) {
    return {
      success: false,
      message: "Course ID is required.",
    };
  }

  const parsed = updateCourseSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid course data.",
    };
  }

  return CourseService.update(
    id,
    session.user.organizationId,
    session.user.branchId,
    {
      ...parsed.data,
      updatedById: session.user.id,
    },
  );
}
