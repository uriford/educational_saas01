"use server";

import { requireAdmin } from "@/features/auth/authorization";
import { StudentService } from "../services/student.service";

export async function getStudentsAction(
  search = "",
  page = 1,
  limit = 10,
) {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    throw new Error("Organization not found");
  }

  return StudentService.getAll(
    session.user.organizationId,
    session.user.branchId,
    search,
    page,
    limit,
  );
}