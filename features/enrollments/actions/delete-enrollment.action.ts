"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { EnrollmentService } from "../services/enrollment.service";

export async function deleteEnrollmentAction(
  id: string,
) {
  try {
    const session = await requireAdmin();

    const organizationId =
      session.user.organizationId;

    if (!organizationId) {
      return {
        success: false,
        message:
          "Organization context is missing.",
      };
    }

    return EnrollmentService.delete(
      id,
      organizationId,
      session.user.branchId ?? undefined,
    );
  } catch (error) {
    console.error(
      "DELETE ENROLLMENT ACTION ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove enrollment.",
    };
  }
}
