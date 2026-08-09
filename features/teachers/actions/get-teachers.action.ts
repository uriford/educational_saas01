"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { TeacherService } from "../services/teacher.service";

export async function getTeachersAction(
  search?: string,
  page = 1,
) {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    throw new Error("Organization not found.");
  }

  return TeacherService.getAll(
    session.user.organizationId,
    session.user.branchId ?? undefined,
    search,
    page,
  );
}