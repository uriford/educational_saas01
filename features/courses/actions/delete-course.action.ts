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

  return CourseService.softDelete(
    id,
    session.user.organizationId,
    session.user.branchId,
  );
}