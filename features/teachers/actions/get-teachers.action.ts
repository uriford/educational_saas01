"use server";

import { auth } from "@/auth";

import { TeacherService } from "../services/teacher.service";

export async function getTeachersAction(
  search?: string,
  page = 1,
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return TeacherService.getAll(
    session.user.organizationId,
    session.user.branchId,
    search,
    page,
  );
}