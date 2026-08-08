"use server";

import { auth } from "@/auth";

import type { CreateCourseData } from "../types";
import { CourseService } from "../services/course.service";

export async function createCourseAction(
  data: CreateCourseData,
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

  return CourseService.create({
    ...data,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
  });
}