"use server";

import { requireAdmin } from "@/features/auth/authorization";

import type { StudentFormValues } from "../schemas/student.schema";
import { StudentService } from "../services/student.service";

export async function updateStudentAction(
  id: string,
  data: StudentFormValues,
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

    return StudentService.update(
      id,
      session.user.organizationId,
      session.user.branchId,
      {
        ...data,
        organizationId: session.user.organizationId,
        branchId: session.user.branchId,
      },
    );
  } catch (error) {
    console.error("UPDATE STUDENT ACTION ERROR:", error);

    return {
      success: false,
      message:
        error instanceof Error &&
        error.message === "Forbidden"
          ? "You do not have permission to update students."
          : "Unauthorized",
    };
  }
}