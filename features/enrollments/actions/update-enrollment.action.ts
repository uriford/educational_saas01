"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { EnrollmentService } from "../services/enrollment.service";
import {
  updateEnrollmentSchema,
} from "../schemas/enrollment.schema";

export async function updateEnrollmentAction(
  id: string,
  input: unknown,
) {
  try {
    const session = await requireAdmin();

    const parsed =
      updateEnrollmentSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ??
          "Invalid enrollment data.",
      };
    }

    const organizationId =
      session.user.organizationId;

    if (!organizationId) {
      return {
        success: false,
        message:
          "Organization context is missing.",
      };
    }

    return EnrollmentService.update(
      id,
      parsed.data,
      organizationId,
      session.user.branchId ?? undefined,
      session.user.id,
    );
  } catch (error) {
    console.error(
      "UPDATE ENROLLMENT ACTION ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update enrollment.",
    };
  }
}
