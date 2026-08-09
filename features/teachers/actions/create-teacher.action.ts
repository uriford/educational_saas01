"use server";

import { requireAdmin } from "@/features/auth/authorization";

import type { TeacherFormValues } from "../schemas/teacher.schema";
import { TeacherService } from "../services/teacher.service";

export async function createTeacherAction(
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

    return TeacherService.create({
      ...data,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
    });
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Forbidden",
    };
  }
}