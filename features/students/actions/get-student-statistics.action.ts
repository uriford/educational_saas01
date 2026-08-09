"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { StudentService } from "../services/student.service";

export async function getStudentStatisticsAction() {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    throw new Error("Organization not found");
  }

  return StudentService.getStatistics(
    session.user.organizationId,
    session.user.branchId,
  );
}