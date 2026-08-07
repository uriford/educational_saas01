"use server";

import { auth } from "@/auth";

import { TeacherService } from "../services/teacher.service";

export async function deleteTeacherAction(
  id: string,
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

  return TeacherService.softDelete(
    id,
    session.user.organizationId,
    session.user.branchId,
  );
}