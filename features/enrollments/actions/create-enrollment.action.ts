"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { EnrollmentService } from "../services/enrollment.service";
import {
  createEnrollmentSchema,
} from "../schemas/enrollment.schema";

export async function createEnrollmentAction(
  input: unknown,
) {
  try {
    const session = await requireAdmin();

    const parsed =
      createEnrollmentSchema.safeParse(input);

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

    const branchId =
      session.user.branchId;

    if (!organizationId) {
      return {
        success: false,
        message:
          "Organization context is missing.",
      };
    }

    return EnrollmentService.create(
      parsed.data,
      organizationId,
      branchId ?? undefined,
      session.user.id,
    );
  } catch (error) {
    console.error(
      "CREATE ENROLLMENT ACTION ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create enrollment.",
    };
  }
}
