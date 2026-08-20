"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { courseSchema } from "../schemas/course.schema";
import { CourseService } from "../services/course.service";

export async function createCourseAction(
  data: unknown,
) {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization not found.",
    };
  }

  const parsed = courseSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid course data.",
    };
  }

  return CourseService.create({
    ...parsed.data,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId ?? null,
    createdById: session.user.id,
  });
}
