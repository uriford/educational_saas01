"use server";

import {
  requireAdmin,
} from "@/features/auth/authorization";
import {
  AIEarlyInterventionService,
} from "../services/ai-early-intervention.service";

export async function analyzeStudentRiskAction(
  studentId: string,
) {
  const session = await requireAdmin();

  const organizationId =
    session.user.organizationId;

  const branchId =
    session.user.branchId;

  if (
    !organizationId ||
    !branchId
  ) {
    return {
      success: false,
      message:
        "Organization or branch context is missing.",
    };
  }

  try {
    return await AIEarlyInterventionService.analyze(
      studentId,
      organizationId,
      branchId,
    );
  } catch (error) {
    console.error(
      "EARLY INTERVENTION ACTION ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to analyze student risk.",
    };
  }
}
