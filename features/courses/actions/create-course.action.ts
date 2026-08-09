"use server";

import { requireAdmin } from "@/features/auth/authorization";

import type { CreateCourseData } from "../types";
import { CourseService } from "../services/course.service";

export async function createCourseAction(
  data: CreateCourseData,
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

  return CourseService.create({
    ...data,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
  });
}