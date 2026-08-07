"use server";

import { auth } from "@/auth";

import type { TeacherFormValues } from "../schemas/teacher.schema";
import { TeacherService } from "../services/teacher.service";

export async function updateTeacherAction(
  id: string,
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

  return TeacherService.update(
    id,
    session.user.organizationId,
    session.user.branchId,
    data,
  );
}