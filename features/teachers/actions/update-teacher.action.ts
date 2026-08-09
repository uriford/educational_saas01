"use server";

import { requireAdmin } from "@/features/auth/authorization";

import type { TeacherFormValues } from "../schemas/teacher.schema";
import { TeacherService } from "../services/teacher.service";

export async function updateTeacherAction(
  id: string,
  data: TeacherFormValues,
) {
  try {
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

    return TeacherService.update(
      id,
      session.user.organizationId,
      session.user.branchId,
      data,
    );
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Forbidden",
    };
  }
}