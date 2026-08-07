"use server";

import { auth } from "@/auth";

import { TeacherService } from "../services/teacher.service";

export async function getTeacherAction(
  id: string,
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return TeacherService.getById(
    id,
    session.user.organizationId,
    session.user.branchId,
  );
}