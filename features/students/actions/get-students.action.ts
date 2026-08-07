"use server";

import { auth } from "@/auth";
import { StudentService } from "../services/student.service";

export async function getStudentsAction(
  search = "",
  page = 1,
  limit = 10
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return StudentService.getAll(
    session.user.organizationId,
    session.user.branchId,
    search,
    page,
    limit
  );
}