"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { EnrollmentService } from "../services/enrollment.service";

export async function getStudentEnrollmentsAction(
  studentId: string,
) {
  try {
    const session = await requireAdmin();

    const organizationId =
      session.user.organizationId;

    if (!organizationId) {
      throw new Error(
        "Organization context is missing.",
      );
    }

    return EnrollmentService.getStudentEnrollments(
      studentId,
      organizationId,
      session.user.branchId ?? undefined,
    );
  } catch (error) {
    console.error(
      "GET STUDENT ENROLLMENTS ACTION ERROR:",
      error,
    );

    throw error;
  }
}
