"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { CourseService } from "../services/course.service";

export async function deleteCourseAction(
  id: string,
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

  if (!id) {
    return {
      success: false,
      message: "Course ID is required.",
    };
  }

  return CourseService.softDelete(
    id,
    session.user.organizationId,
    session.user.branchId,
    session.user.id,
  );
}
