"use server";

import { requireAdmin } from "@/features/auth/authorization";

import type { StudentFormValues } from "../schemas/student.schema";
import { StudentService } from "../services/student.service";

export async function createStudentAction(
  data: StudentFormValues,
) {
  try {
    const session = await requireAdmin();

    if (!session.user.organizationId) {
      return {
        success: false,
        message: "Organization not found.",
      };
    }

    return StudentService.create({
      ...data,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId ?? null,
    });
  } catch (error) {
    console.error("CREATE STUDENT ACTION ERROR:", error);

    return {
      success: false,
      message:
        error instanceof Error &&
        error.message === "Forbidden"
          ? "You do not have permission to create students."
          : "Unauthorized",
    };
  }
}