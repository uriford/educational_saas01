"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { TeacherService } from "../services/teacher.service";

export async function deleteTeacherAction(
  id: string,
) {
  try {
    const session = await requireAdmin();

    if (!session.user.organizationId) {
      return {
        success: false,
        message: "Organization not found.",
      };
    }

    return TeacherService.softDelete(
      id,
      session.user.organizationId,
      session.user.branchId,
    );
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Forbidden",
    };
  }
}