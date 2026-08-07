"use server";

import { auth } from "@/auth";

import type { TeacherFormValues } from "../schemas/teacher.schema";
import { TeacherService } from "../services/teacher.service";

export async function createTeacherAction(
  data: TeacherFormValues,
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

  return TeacherService.create({
    ...data,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
  });
}