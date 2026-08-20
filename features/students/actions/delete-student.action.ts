"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { StudentService } from "../services/student.service";

export async function deleteStudentAction(id: string) {
  try {
    const session = await requireAdmin();

    if (!session.user.organizationId) {
      return {
        success: false,
        message: "Organization not found.",
      };
    }

    return StudentService.softDelete(
      id,
      session.user.organizationId,
      session.user.branchId,
    );
  } catch (error) {
    console.error("DELETE STUDENT ACTION ERROR:", error);

    return {
      success: false,
      message:
        error instanceof Error &&
        error.message === "Forbidden"
          ? "You do not have permission to delete students."
          : "Unauthorized",
    };
  }
}