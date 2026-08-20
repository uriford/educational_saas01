"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { TeacherService } from "../services/teacher.service";

export async function getTeacherAction(id: string) {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    throw new Error("Organization not found.");
  }

  return TeacherService.getById(
    id,
    session.user.organizationId,
    session.user.branchId,
  );
}