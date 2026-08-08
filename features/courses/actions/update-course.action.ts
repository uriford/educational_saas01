"use server";

import { auth } from "@/auth";

import type { UpdateCourseData } from "../types";
import { CourseService } from "../services/course.service";

export async function updateCourseAction(
  id: string,
  data: UpdateCourseData,
) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    return {
      success: false,
      message: "Organization or Branch not found.",
    };
  }

  return CourseService.update(
    id,
    session.user.organizationId,
    session.user.branchId,
    data,
  );
}